package com.university.event_management.controller;

import com.university.event_management.dto.ApiResponse;
import com.university.event_management.model.Role;
import com.university.event_management.model.User;
import com.university.event_management.model.UserStatus;
import com.university.event_management.service.UserService;
import com.university.event_management.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Map;


@RestController
@RequestMapping("api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> loginUser(@RequestBody User user) {

        User loggedInUser = userService.getUserByEmail(user.getEmail());

        if (loggedInUser == null || !passwordEncoder.matches(user.getPassword(), loggedInUser.getPassword())) {
            ApiResponse<User> response = new ApiResponse<>(false, "Invalid email or password", null);
            return ResponseEntity.status(401).body(response);
        }

        if (!loggedInUser.getVerifyEmail()) {
            ApiResponse<User> response = new ApiResponse<>(false, "Your account status is currently 'Pending Verification'.", null);
            return ResponseEntity.status(403).body(response);
        }

        if (loggedInUser.getUserStatus() == UserStatus.pending) {
            ApiResponse<User> response = new ApiResponse<>(false, "Your account is pending admin approval.", null);
            return ResponseEntity.status(403).body(response);
        }

        loggedInUser.setPassword(null);
        final String jwtToken = jwtUtil.generateToken(loggedInUser);

        ApiResponse<User> response = new ApiResponse<>(true, "Login successful", loggedInUser, jwtToken);
        return ResponseEntity.ok(response);
    }


    // Registration endpoint
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody User user) {

        if (userService.getUserByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, "Email already exists", null));
        }

        if (user.getRole() == Role.organizer) {
            user.setUserStatus(UserStatus.pending);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User createdUser = userService.createUser(user);


        try {
            userService.sendWelcomeEmail(user.getEmail());
        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
        }

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User created successfully", createdUser)
        );
    }

    // send verification email when register
    @PostMapping("/send-verifyEmail/{email}")
    public ResponseEntity<ApiResponse<String>> sendVerifyEmailOTP(@PathVariable String email) {
        if (email.equals(null) || email.equals("")) {
            return ResponseEntity.status(400).body(
                    new ApiResponse<>(false, "not a valid email", null)
            );
        }

        try {
            userService.sendVerifyEmailOTP(email);
            ApiResponse<String> response = new ApiResponse<>(true, "OTP sent successfully", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(500).body(response);
        }
    }

    // verify otp when register
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Boolean>> verifyEmailOTP(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String otp = payload.get("otp");


            boolean verified = userService.verifyOtp(otp);

            if (verified) {
                User user = userService.getUserByEmail(email);
                user.setVerifyEmail(true);
                userService.updateUser(user.getId(), user);

                return ResponseEntity.ok(new ApiResponse<>(true, "OTP verify success", true));
            } else {
                return ResponseEntity.status(400).body(new ApiResponse<>(false, "Invalid OTP", false));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Server error", false));
        }
    }


    // Send Otp endpoint
    @PostMapping("/send-otp/{email}")
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
    @PostMapping("/verify-otp/{otp}")
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
    @PostMapping("/change-forget-password")
    public ResponseEntity<ApiResponse<String>> changeForgetPassword(@RequestBody User user) {
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


    // password change endpoint
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody Map<String, Object> body) {
        try {
            String email = (String) body.get("email");
            String password = (String) body.get("password");
            String currentPassword = (String) body.get("currentPassword");

            User passwordChangeUser = userService.getUserByEmail(email);
            if (passwordChangeUser == null) {
                ApiResponse<String> response = new ApiResponse<>(false, "User not found", null);
                return ResponseEntity.status(404).body(response);
            }

            if (!passwordEncoder.matches(currentPassword, passwordChangeUser.getPassword())) {
                ApiResponse<String> response = new ApiResponse<>(false, "current Password does not match", null);
                return ResponseEntity.status(400).body(response);
            }

            passwordChangeUser.setPassword(passwordEncoder.encode(password));
            userService.updateUser(passwordChangeUser.getId(), passwordChangeUser);
            ApiResponse<String> response = new ApiResponse<>(true, "Password change successfully", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = new ApiResponse<>(false, "OTP verification failed due to server error", null);
            return ResponseEntity.status(500).body(response);
        }
    }
}