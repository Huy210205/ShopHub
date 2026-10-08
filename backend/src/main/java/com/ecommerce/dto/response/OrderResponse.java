package com.ecommerce.dto.response;

import com.ecommerce.entity.enums.OrderStatus;
import com.ecommerce.entity.enums.PaymentMethod;
import com.ecommerce.entity.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private List<OrderItemResponse> items;
    private PaymentInfo payment;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class PaymentInfo {
        private PaymentMethod paymentMethod;
        private PaymentStatus paymentStatus;
        private String transactionId;
    }
}
