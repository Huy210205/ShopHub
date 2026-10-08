package com.ecommerce.dto.request;

import com.ecommerce.entity.enums.OrderStatus;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class UpdateOrderStatusRequest {
    @NotNull
    private OrderStatus status;
}
