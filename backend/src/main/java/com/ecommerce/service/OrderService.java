package com.ecommerce.service;

import com.ecommerce.dto.request.PlaceOrderRequest;
import com.ecommerce.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.entity.*;
import com.ecommerce.entity.enums.OrderStatus;
import com.ecommerce.entity.enums.PaymentMethod;
import com.ecommerce.entity.enums.PaymentStatus;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.EntityMapper;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.PaymentRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartService cartService;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request) {
        Cart cart = cartService.getOrCreateCart();
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        validatePaymentDetails(request);

        User user = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<OrderItem>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            }
            product.setStock(product.getStock() - cartItem.getQuantity());
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .build();
            orderItems.add(orderItem);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .items(orderItems)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }

        order = orderRepository.save(order);

        Payment payment = processPayment(order, request);
        order.setPayment(payment);
        paymentRepository.save(payment);

        cartService.clearCart(cart);
        return mapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = findOrder(orderId);
        if (!order.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BadRequestException("Not authorized to cancel this order");
        }
        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel order in current status");
        }
        if (order.getStatus() != OrderStatus.CANCELLED) {
            restoreStock(order);
            order.setStatus(OrderStatus.CANCELLED);
            if (order.getPayment() != null) {
                order.getPayment().setPaymentStatus(PaymentStatus.REFUNDED);
            }
        }
        return mapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = findOrder(orderId);
        return mapper.toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrdersForUser(Long userId, Pageable pageable) {
        Page<OrderResponse> page = orderRepository.findByUserId(userId, pageable)
                .map(mapper::toOrderResponse);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(Pageable pageable) {
        Page<OrderResponse> page = orderRepository.findAll(pageable).map(mapper::toOrderResponse);
        return PageResponse.from(page);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = findOrder(orderId);
        order.setStatus(request.getStatus());
        return mapper.toOrderResponse(orderRepository.save(order));
    }

    private Payment processPayment(Order order, PlaceOrderRequest request) {
        PaymentStatus status;
        String transactionId = null;

        switch (request.getPaymentMethod()) {
            case CREDIT_CARD:
                if (request.getCardNumber() == null || request.getCardNumber().length() < 13) {
                    throw new BadRequestException("Invalid card number");
                }
                status = PaymentStatus.COMPLETED;
                transactionId = "CARD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                break;
            case UPI:
                if (request.getUpiId() == null || !request.getUpiId().contains("@")) {
                    throw new BadRequestException("Invalid UPI ID");
                }
                status = PaymentStatus.COMPLETED;
                transactionId = "UPI-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                break;
            case CASH_ON_DELIVERY:
                status = PaymentStatus.PENDING;
                transactionId = "COD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                break;
            default:
                throw new BadRequestException("Invalid payment method");
        }

        return Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(status)
                .transactionId(transactionId)
                .build();
    }

    private void validatePaymentDetails(PlaceOrderRequest request) {
        if (request.getPaymentMethod() == PaymentMethod.CREDIT_CARD &&
                (request.getCardNumber() == null || request.getCardNumber().isEmpty())) {
            throw new BadRequestException("Card number is required");
        }
        if (request.getPaymentMethod() == PaymentMethod.UPI &&
                (request.getUpiId() == null || request.getUpiId().isEmpty())) {
            throw new BadRequestException("UPI ID is required");
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
        }
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }
}
