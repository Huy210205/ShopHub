package com.ecommerce.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class SupportTicketRequest {
    private String email;
    
    @NotBlank
    private String subject;
    
    @NotBlank
    private String description;
}
