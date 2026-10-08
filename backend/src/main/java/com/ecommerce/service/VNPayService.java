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
        // VNPay yêu cầu amount * 100 (đơn vị: đồng → xu)
        long vnpAmount = amount.multiply(BigDecimal.valueOf(100)).longValue();
        String vnpTxnRef = orderId + "_" + System.currentTimeMillis();

        TimeZone vnTimeZone = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(vnTimeZone);

        Calendar cal = Calendar.getInstance(vnTimeZone);
        String createDate = sdf.format(cal.getTime());
        cal.add(Calendar.MINUTE, 15);
        String expireDate = sdf.format(cal.getTime());

        Map<String, String> vnpParams = new TreeMap<>();
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

        // Build query string & tính hash
        StringBuilder queryBuilder = new StringBuilder();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            queryBuilder.append(urlEncode(entry.getKey()))
                    .append("=")
                    .append(urlEncode(entry.getValue()))
                    .append("&");
        }
        String queryString = queryBuilder.toString();
        String hashData = queryString.substring(0, queryString.length() - 1); // bỏ & cuối
        String secureHash = hmacSHA512(hashSecret, hashData);

        return payUrl + "?" + queryString + "vnp_SecureHash=" + secureHash;
    }

    /**
     * Xác minh chữ ký VNPay từ callback
     */
    public boolean verifySignature(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        if (vnpSecureHash == null) return false;

        // Loại bỏ các field không tham gia hash
        Map<String, String> sorted = new TreeMap<>(params);
        sorted.remove("vnp_SecureHash");
        sorted.remove("vnp_SecureHashType");

        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> e : sorted.entrySet()) {
            sb.append(urlEncode(e.getKey()))
              .append("=")
              .append(urlEncode(e.getValue()))
              .append("&");
        }
        String hashData = sb.substring(0, sb.length() - 1);
        String calculatedHash = hmacSHA512(hashSecret, hashData);
        return calculatedHash.equalsIgnoreCase(vnpSecureHash);
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
