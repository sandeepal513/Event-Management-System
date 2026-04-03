package com.university.event_management.controller;

import com.university.event_management.dto.ApiResponse;
import com.university.event_management.model.User;
import com.university.event_management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;


    // Login endpoint
    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<User>> loginUser(@RequestBody User user) {

        User loggedInUser = userService.getUserByEmail(user.getEmail());

        if (loggedInUser == null || !passwordEncoder.matches(user.getPassword(), loggedInUser.getPassword())) {
            ApiResponse<User> response = new ApiResponse<>(false, "Invalid email or password", null);
            return ResponseEntity.status(401).body(response);
        }

        loggedInUser.setPassword(null);
        ApiResponse<User> response = new ApiResponse<>(true, "Login successful", loggedInUser);
        return ResponseEntity.ok(response);
    }


    // Registration endpoint
    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody User user) {
        if (userService.getUserByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, "Email already exists", null));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User createdUser = userService.createUser(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "User created successfully", createdUser));
    }


    // Send Otp endpoint
    @PostMapping("/auth/send-otp/{email}")
    public ResponseEntity<ApiResponse<String>> sendOtp(@PathVariable String email) {
        User existingUser = userService.getUserByEmail(email);
        if (existingUser == null) {
            ApiResponse<String> response = new ApiResponse<>(false, "Email not found", null);
            return ResponseEntity.status(404).body(response);
        }
        try {
            userService.generateAndSendOtp(email);
            ApiResponse<String> response = new ApiResponse<>(true, "OTP sent successfully", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(500).body(response);
        }
    }

    // verify Otp endpoint
    @PostMapping("/auth/verify-otp/{otp}")
    public ResponseEntity<ApiResponse<Boolean>> verifyOTP(@PathVariable String otp) {
        try {
            boolean verified = userService.verifyOtp(otp);

            if (verified) {
                ApiResponse<Boolean> response = new ApiResponse<>(true, "OTP verify success", true);
                return ResponseEntity.ok(response);
            } else {
                ApiResponse<Boolean> response = new ApiResponse<>(false, "Invalid OTP", false);
                return ResponseEntity.status(400).body(response);
            }

        } catch (Exception e) {
            e.printStackTrace(); // log the exception
            ApiResponse<Boolean> response = new ApiResponse<>(false, "OTP verification failed due to server error", false);
            return ResponseEntity.status(500).body(response);
        }
    }


    // password change endpoint
    @PostMapping("/auth/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody User user) {
        try {
            User passwordChangeUser = userService.getUserByEmail(user.getEmail());
            if (passwordChangeUser == null) {
                ApiResponse<String> response = new ApiResponse<>(false, "User not found", null);
                return ResponseEntity.status(404).body(response);
            }
            passwordChangeUser.setPassword(passwordEncoder.encode(user.getPassword()));
            userService.updateUser(passwordChangeUser.getId(), passwordChangeUser);
            ApiResponse<String> response = new ApiResponse<>(true, "Password change successfully", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = new ApiResponse<>(false, "OTP verification failed due to server error", null);
            return ResponseEntity.status(500).body(response);
        }
    }

    // User management endpoints
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers() {
        List<User> users = userService.getUsers();
        ApiResponse<List<User>> response = new ApiResponse<>(true, "Users retrieved successfully", users);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable Integer id) {
        User user = userService.getUser(id);
        ApiResponse<User> response = new ApiResponse<>(true, "User retrieved successfully", user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Integer id,
                                                        @RequestBody User updateUser) {
        User user = userService.updateUser(id, updateUser);
        ApiResponse<User> response = new ApiResponse<>(true, "User updated successfully", user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        ApiResponse<Void> response = new ApiResponse<>(true, "User deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}