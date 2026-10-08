package com.ecommerce.service;

import com.ecommerce.dto.request.ContactRequest;
import com.ecommerce.dto.request.SupportTicketRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private static final String TARGET_EMAIL = "vamsiukkusuri@gmail.com";

    public void sendContactEmail(ContactRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(TARGET_EMAIL);
            message.setSubject("New Contact Inquiry - " + request.getName());
            message.setText("You have received a new contact form submission on ShopHub:\n\n"
                    + "Sender Name: " + request.getName() + "\n"
                    + "Sender Email: " + request.getEmail() + "\n\n"
                    + "Message Details:\n"
                    + request.getMessage() + "\n\n"
                    + "Regards,\nShopHub Mailer");
            mailSender.send(message);
            System.out.println("[EMAIL SENT] Successfully sent contact inquiry email to " + TARGET_EMAIL);
        } catch (Exception e) {
            System.err.println("Failed to send contact email: " + e.getMessage());
            // Log fallback for dev
            System.out.println("====== CONTACT INQUIRY FALLBACK DEV LOG ======");
            System.out.println("Recipient: " + TARGET_EMAIL);
            System.out.println("Sender: " + request.getEmail() + " (" + request.getName() + ")");
            System.out.println("Message: " + request.getMessage());
            System.out.println("==============================================");
        }
    }

    public void sendSupportTicketEmail(SupportTicketRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(TARGET_EMAIL);
            message.setSubject("New Support Ticket/Query - " + request.getSubject());
            message.setText("A new customer support ticket has been raised on ShopHub:\n\n"
                    + "Customer Email: " + (request.getEmail() != null ? request.getEmail() : "Anonymous/Guest") + "\n"
                    + "Subject: " + request.getSubject() + "\n\n"
                    + "Description:\n"
                    + request.getDescription() + "\n\n"
                    + "Regards,\nShopHub Mailer");
            mailSender.send(message);
            System.out.println("[EMAIL SENT] Successfully sent support ticket email to " + TARGET_EMAIL);
        } catch (Exception e) {
            System.err.println("Failed to send support ticket email: " + e.getMessage());
            // Log fallback for dev
            System.out.println("====== SUPPORT TICKET FALLBACK DEV LOG ======");
            System.out.println("Recipient: " + TARGET_EMAIL);
            System.out.println("Customer: " + (request.getEmail() != null ? request.getEmail() : "Anonymous/Guest"));
            System.out.println("Subject: " + request.getSubject());
            System.out.println("Description: " + request.getDescription());
            System.out.println("=============================================");
        }
    }
}
