package com.ecommerce.service;

import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.Review;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.mapper.EntityMapper;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductService productService;
    private final UserService userService;
    private final EntityMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
        Page<ReviewResponse> page = reviewRepository.findByProductId(productId, pageable)
                .map(mapper::toReviewResponse);
        return PageResponse.from(page);
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ReviewResponse addReview(Long productId, ReviewRequest request) {
        if (reviewRepository.findByUserIdAndProductId(SecurityUtils.getCurrentUserId(), productId).isPresent()) {
            throw new BadRequestException("You have already reviewed this product");
        }
        Product product = productService.findProduct(productId);
        User user = userService.getCurrentUserEntity();

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        review = reviewRepository.save(review);
        updateProductRating(product);
        return mapper.toReviewResponse(review);
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        Review review = findReview(reviewId);
        if (!review.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BadRequestException("Not authorized to edit this review");
        }
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);
        updateProductRating(review.getProduct());
        return mapper.toReviewResponse(review);
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = findReview(reviewId);
        if (!review.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BadRequestException("Not authorized to delete this review");
        }
        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductRating(product);
    }

    private void updateProductRating(Product product) {
        Double avg = reviewRepository.getAverageRatingByProductId(product.getId());
        long count = reviewRepository.countByProductId(product.getId());
        product.setAverageRating(avg != null ? avg : 0.0);
        product.setReviewCount((int) count);
    }

    private Review findReview(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }
}
