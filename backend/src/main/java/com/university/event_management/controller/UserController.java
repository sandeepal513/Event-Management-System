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

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (userService.getUserByEmail(user.getEmail()) != null) {
            ApiResponse<User> response = new ApiResponse<>(false, "Email already exists", null);
            return ResponseEntity.status(400).body(response);
        }
        User createdUser = userService.createUser(user);
        ApiResponse<User> response = new ApiResponse<>(true, "User created successfully", createdUser);
        return ResponseEntity.ok(response);
    }

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