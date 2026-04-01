package com.university.event_management.controller;

import com.university.event_management.dto.ApiResponse;
import com.university.event_management.model.User;
import com.university.event_management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class UserController {

    @Autowired
    private UserService userService;

    // ─── VIEW ENDPOINTS ───────────────────────────────────────────────

    /** Serves the Thymeleaf login page at GET /login */
    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                            @RequestParam(value = "logout", required = false) String logout,
                            @RequestParam(value = "success", required = false) String success,
                            Model model) {
        if (error != null) {
            model.addAttribute("errorMsg", "Invalid email or password.");
        }
        if (logout != null) {
            model.addAttribute("successMsg", "You have been logged out.");
        }
        if (success != null) {
            model.addAttribute("successMsg", "You have been Login.");
            try {
                Thread.sleep(5000); // Simulate processing delay
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        return "auth/authLogin";
    }


    @GetMapping("/register")
    public String registerPage() {
        return "auth/authRegister";
    }


    @PostMapping("/auth/login")
    public String loginUser(@RequestParam("username") String email,
                            @RequestParam("password") String password,
                            @RequestParam(value = "remember", required = false) String remember,
                            Model model) {

        User user = userService.getUserByEmail(email);

        if (user == null || !user.getPassword().equals(password)) {
            return "redirect:/login?error";
        }

        // TODO: create a session / JWT token here as needed
        return "redirect:/login?success";
    }


    @PostMapping("/api/v1/auth/register")
    @ResponseBody
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        ApiResponse<User> response = new ApiResponse<>(true, "User created successfully", createdUser);
        return ResponseEntity.ok(response);
    }

    // ─── USER CRUD API ────────────────────────────────────────────────

    @GetMapping("/api/v1/users")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<User>>> getUsers() {
        List<User> users = userService.getUsers();
        ApiResponse<List<User>> response = new ApiResponse<>(true, "Users retrieved successfully", users);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/users/{id}")
    @ResponseBody
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable Integer id) {
        User user = userService.getUser(id);
        ApiResponse<User> response = new ApiResponse<>(true, "User retrieved successfully", user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/v1/users/{id}")
    @ResponseBody
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Integer id,
                                                        @RequestBody User updateUser) {
        User user = userService.updateUser(id, updateUser);
        ApiResponse<User> response = new ApiResponse<>(true, "User updated successfully", user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/v1/users/{id}")
    @ResponseBody
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        ApiResponse<Void> response = new ApiResponse<>(true, "User deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}