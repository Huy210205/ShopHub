package com.ecommerce.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
public class VNPayService {

    @Value("${vnpay.tmn-code:DEMOV210}")
    private String tmnCode;

    @Value("${vnpay.hash-secret:RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ}")
    private String hashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${vnpay.return-url:http://localhost:5173/vnpay/return}")
    private String returnUrl;

    /**
     * Tạo URL thanh toán VNPay
     *
     * @param orderId  ID đơn hàng
     * @param amount   Số tiền (VND)
     * @param orderInfo Mô tả đơn hàng
     * @param ipAddr   IP người dùng
     * @return URL redirect sang trang thanh toán VNPay
     */
    public String createPaymentUrl(Long orderId, BigDecimal amount, String orderInfo, String ipAddr) {
        String vnpVersion = "2.1.0";
        String vnpCommand = "pay";
        String vnpCurrCode = "VND";
        String vnpLocale = "vn";
        String vnpOrderType = "other";
        // VNPay yêu cầu amount * 100 (đơn vị: đồng -> xu). Tối thiểu 5,000 VND (500,000 xu) trên Sandbox
        long vnpAmount = amount.multiply(BigDecimal.valueOf(100)).longValue();
        if (vnpAmount < 500000L) {
            vnpAmount = 1000000L; // Tối thiểu 10,000 VND cho test Sandbox
        }
        String vnpTxnRef = orderId + "_" + System.currentTimeMillis();

        TimeZone vnTimeZone = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(vnTimeZone);

        Calendar cal = Calendar.getInstance(vnTimeZone);
        String createDate = sdf.format(cal.getTime());
        cal.add(Calendar.MINUTE, 15);
        String expireDate = sdf.format(cal.getTime());

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnpVersion);
        vnpParams.put("vnp_Command", vnpCommand);
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(vnpAmount));
        vnpParams.put("vnp_CurrCode", vnpCurrCode);
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", vnpOrderType);
        vnpParams.put("vnp_Locale", vnpLocale);
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", ipAddr);
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);

        // Chuẩn hóa theo VNPay Java Demo: sắp xếp key theo alphabet
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data (field name không encode, value encode)
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(urlEncode(fieldValue));

                // Build query
                query.append(urlEncode(fieldName));
                query.append('=');
                query.append(urlEncode(fieldValue));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String secureHash = hmacSHA512(hashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + secureHash;

        log.info("VNPay hashData: {}", hashData);
        log.info("VNPay secureHash: {}", secureHash);
        log.info("VNPay paymentUrl: {}?{}", payUrl, queryUrl);

        return payUrl + "?" + queryUrl;
    }

    /**
     * Xác minh chữ ký VNPay từ callback
     */
    public boolean verifySignature(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        if (vnpSecureHash == null) return false;

        Map<String, String> fields = new HashMap<>(params);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(urlEncode(fieldValue));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String calculatedHash = hmacSHA512(hashSecret, hashData.toString());
        boolean isValid = calculatedHash.equalsIgnoreCase(vnpSecureHash);
        log.info("VNPay verifySignature - calculated: {}, received: {}, isValid: {}", calculatedHash, vnpSecureHash, isValid);
        return isValid;
    }

    private String urlEncode(String value) {
        if (value == null) return "";
        try {
            return URLEncoder.encode(value, StandardCharsets.US_ASCII.toString());
        } catch (Exception e) {
            return value;
        }
    }

    /**
     * Lấy orderId từ vnp_TxnRef (format: orderId_timestamp)
     */
    public Long extractOrderId(String vnpTxnRef) {
        try {
            return Long.parseLong(vnpTxnRef.split("_")[0]);
        } catch (Exception e) {
            log.error("Cannot parse orderId from txnRef: {}", vnpTxnRef);
            return null;
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error computing HMAC-SHA512", e);
        }
    }
}
