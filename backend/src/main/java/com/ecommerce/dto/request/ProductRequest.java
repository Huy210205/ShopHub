package com.ecommerce.dto.request;

import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank @Size(max = 200)
    private String name;
    private String description;
    @NotNull @DecimalMin("0.01")
    private BigDecimal price;
    @NotNull @Min(0)
    private Integer stock;
    private String imageUrl;
    @NotNull
    private Long categoryId;
}
