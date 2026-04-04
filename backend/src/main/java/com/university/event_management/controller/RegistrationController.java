package com.university.event_management.controller;

import com.university.event_management.model.Registration;
import com.university.event_management.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/regitration")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @GetMapping
    public ResponseEntity<List<Registration>> getAll() {
        return ResponseEntity.ok(registrationService.getAll());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Registration> approve(@PathVariable int id) {
        return ResponseEntity.ok(registrationService.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Registration> reject(@PathVariable int id) {
        return ResponseEntity.ok(registrationService.reject(id));
    }


}
