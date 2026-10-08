package com.ecommerce.service;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.EntityMapper;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    @Transactional
    public void createCartForUser(User user) {
        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getCart() {
        Cart cart = getOrCreateCart();
        return mapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(CartItemRequest request) {
        Cart cart = getOrCreateCart();
        Product product = productService.findProduct(request.getProductId());

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock");
        }

        CartItem existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (existing != null) {
            int newQty = existing.getQuantity() + request.getQuantity();
            if (product.getStock() < newQty) {
                throw new BadRequestException("Insufficient stock");
            }
            existing.setQuantity(newQty);
            cartItemRepository.saveAndFlush(existing);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            CartItem savedItem = cartItemRepository.saveAndFlush(item);
            cart.getItems().add(savedItem);
        }
        cartRepository.saveAndFlush(cart);
        return mapper.toCartResponse(getOrCreateCart());
    }

    @Transactional
    public CartResponse updateCartItem(Long productId, Integer quantity) {
        Cart cart = getOrCreateCart();
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
            cartItemRepository.flush();
        } else {
            if (item.getProduct().getStock() < quantity) {
                throw new BadRequestException("Insufficient stock");
            }
            item.setQuantity(quantity);
            cartItemRepository.saveAndFlush(item);
        }
        cartRepository.saveAndFlush(cart);
        return mapper.toCartResponse(getOrCreateCart());
    }

    @Transactional
    public CartResponse removeFromCart(Long productId) {
        Cart cart = getOrCreateCart();
        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        cartItemRepository.flush();
        cart.getItems().removeIf(i -> i.getProduct().getId().equals(productId));
        cartRepository.saveAndFlush(cart);
        return mapper.toCartResponse(getOrCreateCart());
    }

    @Transactional
    public void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepository.saveAndFlush(cart);
    }

    Cart getOrCreateCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Cart cart = Cart.builder().user(user).build();
            return cartRepository.save(cart);
        });
    }
}
