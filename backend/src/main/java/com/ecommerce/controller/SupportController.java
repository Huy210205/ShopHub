package com.ecommerce.controller;

import com.ecommerce.dto.request.ContactRequest;
import com.ecommerce.dto.request.SupportTicketRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
@Tag(name = "Support")
public class SupportController {

    private final EmailService emailService;

    @PostMapping("/contact")
    @Operation(summary = "Submit a contact query")
    public ResponseEntity<ApiResponse<Void>> submitContact(@Valid @RequestBody ContactRequest request) {
        emailService.sendContactEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Message sent! We will contact you soon.", null));
    }

    @PostMapping("/ticket")
    @Operation(summary = "Raise a support ticket")
    public ResponseEntity<ApiResponse<Void>> raiseTicket(@Valid @RequestBody SupportTicketRequest request) {
        emailService.sendSupportTicketEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Ticket raised successfully!", null));
    }
}
