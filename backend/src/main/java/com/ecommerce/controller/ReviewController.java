package com.ecommerce.controller;

import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get product reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ReviewResponse> reviews = reviewService.getProductReviews(
                productId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PostMapping
    @Operation(summary = "Add review")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @PathVariable Long productId, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Review added", reviewService.addReview(productId, request)));
    }

    @PutMapping("/{reviewId}")
    @Operation(summary = "Update review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long productId, @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Review updated", reviewService.updateReview(reviewId, request)));
    }

    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Delete review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long productId, @PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
