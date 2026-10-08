package com.ecommerce.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class UpdateProfileRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String name;
    private String phone;
    private String address;
}
