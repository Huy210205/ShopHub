package com.ecommerce.controller;

import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.entity.enums.PaymentMethod;
import com.ecommerce.entity.enums.PaymentStatus;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.VNPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/vnpay")
@RequiredArgsConstructor
@Tag(name = "VNPay")
public class VNPayController {

    private final VNPayService vnPayService;
    private final OrderService orderService;

    @PostMapping("/create-payment")
    @Operation(summary = "Tạo URL thanh toán VNPay")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPayment(
            @RequestParam Long orderId,
            @RequestParam BigDecimal amount,
            HttpServletRequest request) {

        String ipAddr = getClientIp(request);
        String orderInfo = "Thanh toan don hang #" + orderId;
        String paymentUrl = vnPayService.createPaymentUrl(orderId, amount, orderInfo, ipAddr);

        Map<String, String> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(ApiResponse.success("Payment URL created", result));
    }

    @GetMapping("/return")
    @Operation(summary = "VNPay callback sau thanh toán")
    public ResponseEntity<ApiResponse<Map<String, Object>>> vnpayReturn(
            @RequestParam Map<String, String> params) {

        Map<String, Object> result = new HashMap<>();
        boolean isValid = vnPayService.verifySignature(params);

        if (!isValid) {
            result.put("success", false);
            result.put("message", "Invalid signature");
            return ResponseEntity.ok(ApiResponse.success("Signature invalid", result));
        }

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        String transactionNo = params.get("vnp_TransactionNo");
        Long orderId = vnPayService.extractOrderId(txnRef);

        boolean isSuccess = "00".equals(responseCode);

        if (orderId != null) {
            PaymentStatus status = isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
            orderService.updateVNPayPayment(orderId, status, transactionNo);
        }

        result.put("success", isSuccess);
        result.put("orderId", orderId);
        result.put("transactionNo", transactionNo);
        result.put("responseCode", responseCode);
        result.put("message", isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại (mã: " + responseCode + ")");

        return ResponseEntity.ok(ApiResponse.success("VNPay return processed", result));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) ip = request.getRemoteAddr();
        if (ip == null || "0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) ip = "127.0.0.1";
        return ip;
    }
}
