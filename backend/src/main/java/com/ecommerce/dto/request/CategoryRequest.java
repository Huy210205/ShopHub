package com.ecommerce.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class CategoryRequest {
    @NotBlank @Size(max = 100)
    private String name;
    private String description;
}
