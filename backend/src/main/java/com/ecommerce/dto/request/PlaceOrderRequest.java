package com.ecommerce.dto.request;

import com.ecommerce.entity.enums.PaymentMethod;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class PlaceOrderRequest {
    @NotBlank
    private String shippingAddress;
    @NotNull
    private PaymentMethod paymentMethod;
    private String cardNumber;
    private String upiId;
}
