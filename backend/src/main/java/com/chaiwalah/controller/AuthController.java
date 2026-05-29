package com.chaiwalah.controller;

import com.chaiwalah.model.LoginRequest;
import com.chaiwalah.model.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Hardcoded admin credentials for initial setup
        if ("admin@thechaiwalah.in".equals(request.getEmail()) && "admin123".equals(request.getPassword())) {
            // In a real app, generate a secure JWT token here
            String fakeToken = "admin-secret-token-12345";
            return ResponseEntity.ok(new LoginResponse(true, "Login successful", fakeToken));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(false, "Invalid email or password", null));
        }
    }
}
