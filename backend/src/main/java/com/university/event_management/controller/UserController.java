package com.university.event_management.controller;

import com.university.event_management.dto.ApiResponse;
import com.university.event_management.model.User;
import com.university.event_management.model.UserStatus;
import com.university.event_management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/v1")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // User management endpoints
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers() {
        List<User> users = userService.getUsers();
        if(users.isEmpty()) {
            ApiResponse<List<User>> response = new ApiResponse<>(true, "Users Not found", users);
            return ResponseEntity.ok(response);
        }
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
        User currentUser = userService.getUser(id);

        if (!currentUser.getEmail().equals(updateUser.getEmail()) && userService.getUserByEmail(updateUser.getEmail()) != null) {
            ApiResponse<User> response = new ApiResponse<>(false, "Email Already Exists", null);
            return ResponseEntity.ok(response);
        }
        currentUser.setName(updateUser.getName());
        currentUser.setEmail(updateUser.getEmail());
        currentUser.setPhoneNo(updateUser.getPhoneNo());
        currentUser.setImage(updateUser.getImage());
        currentUser.setVerifyEmail(updateUser.getVerifyEmail());
        User user = userService.updateUser(id, currentUser);

        ApiResponse<User> response = new ApiResponse<>(true, "User updated successfully", user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        ApiResponse<Void> response = new ApiResponse<>(true, "User deleted successfully", null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/username/{username}")
    public ResponseEntity<ApiResponse<User>> getUserByUsername(@PathVariable String username) {
        try {
            User user = userService.getUserByEmail(username);
            if (user == null) {
                return ResponseEntity.status(404)
                        .body(new ApiResponse<>(false, "User not found", null));
            }

            user.setPassword(null);
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "User retrieved successfully", user)
            );

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Server error: " + e.getMessage(), null));
        }
    }

    // update organizerStatus
    @PutMapping("/users/{organizerId}/status")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(@PathVariable Integer organizerId, @RequestBody Map<String, Object> body
    ) throws UnsupportedEncodingException {

        User user = userService.getUser(organizerId);

        String status = String.valueOf(body.get("userStatus"));
        System.out.println(status);
        String reason = "";

        if ("APPROVED".equalsIgnoreCase(status)) {
            user.setUserStatus(UserStatus.approve);
        } else {
            user.setUserStatus(UserStatus.reject);
            reason = (String) body.get("reason");
        }

        try {
            userService.updateUser(user.getId(), user);
            userService.sendOrganizerApproveRejectMail(user.getEmail(), user.getUserStatus().toString(), reason);

            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Organizer status update success", null)
            );

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    new ApiResponse<>(false, "Organizer status update failed", null)
            );
        }
    }
}