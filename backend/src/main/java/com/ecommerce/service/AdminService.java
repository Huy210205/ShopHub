package com.ecommerce.service;

import com.ecommerce.dto.response.AnalyticsResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.TopProductResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.mapper.EntityMapper;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final EntityMapper mapper;

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics() {
        List<Object[]> topSelling = productRepository.findTopSellingProducts();
        List<TopProductResponse> topProducts = new ArrayList<TopProductResponse>();

        int limit = Math.min(topSelling.size(), 5);
        for (int i = 0; i < limit; i++) {
            Object[] row = topSelling.get(i);
            Long productId = (Long) row[0];
            Long totalSold = ((Number) row[1]).longValue();
            Product product = productRepository.findById(productId).orElse(null);
            if (product != null) {
                topProducts.add(TopProductResponse.builder()
                        .productId(productId)
                        .productName(product.getName())
                        .imageUrl(product.getImageUrl())
                        .totalSold(totalSold)
                        .build());
            }
        }

        List<OrderResponse> recentOrders = new ArrayList<OrderResponse>();
        orderRepository.findTop10ByOrderByCreatedAtDesc().forEach(o ->
                recentOrders.add(mapper.toOrderResponse(o)));

        BigDecimal revenue = orderRepository.getTotalRevenue();
        if (revenue == null) {
            revenue = BigDecimal.ZERO;
        }

        return AnalyticsResponse.builder()
                .totalUsers(userRepository.count())
                .totalProducts(productRepository.count())
                .totalOrders(orderRepository.count())
                .totalRevenue(revenue)
                .topSellingProducts(topProducts)
                .recentOrders(recentOrders)
                .build();
    }
}
