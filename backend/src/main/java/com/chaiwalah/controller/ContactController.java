package com.chaiwalah.controller;

import com.chaiwalah.model.ContactRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    // In-memory storage for demonstration purposes (resets on server restart)
    private final List<ContactRequest> messages = Collections.synchronizedList(new ArrayList<>());

    @PostMapping
    public ResponseEntity<String> submitContactForm(@RequestBody ContactRequest request) {
        System.out.println("Received contact request from: " + request.getName());
        
        // Store the message
        messages.add(request);
        
        return ResponseEntity.ok("{\"status\": \"success\", \"message\": \"Thanks for contacting us! We'll get back to you soon.\"}");
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ContactRequest>> getMessages(@RequestHeader(value="Authorization", required=false) String authHeader) {
        // Simple mock authentication check
        if (authHeader == null || !authHeader.contains("admin-secret-token-12345")) {
            return ResponseEntity.status(401).build();
        }
        
        return ResponseEntity.ok(messages);
    }
}
