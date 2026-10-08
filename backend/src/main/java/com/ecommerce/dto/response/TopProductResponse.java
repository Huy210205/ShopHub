package com.ecommerce.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopProductResponse {
    private Long productId;
    private String productName;
    private String imageUrl;
    private Long totalSold;
}
