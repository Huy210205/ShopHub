package com.ecommerce.dto.request;

import lombok.Data;

import javax.validation.constraints.*;

@Data
public class ReviewRequest {
    @NotNull @Min(1) @Max(5)
    private Integer rating;
    @Size(max = 1000)
    private String comment;
}
