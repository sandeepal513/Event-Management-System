package com.university.event_management.controller;

import com.university.event_management.dto.ApiResponse;
import com.university.event_management.model.Society;
import com.university.event_management.service.SocietyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/societies")
public class SocietyController {

    @Autowired
    private SocietyService societyService;

    @PostMapping
    public ResponseEntity<ApiResponse<Society>> createSociety(@RequestBody Society society) {
        Society createdSociety = societyService.createSociety(society);
        ApiResponse<Society> response = new ApiResponse<>(true, "Society created successfully", createdSociety);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Society>>> getSocieties() {
        List<Society> societies = societyService.getSocieties();
        ApiResponse<List<Society>> response = new ApiResponse<>(true, "Societies retrieved successfully", societies);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Society>> getSociety(@PathVariable Integer id) {
        Society society = societyService.getSociety(id);
        ApiResponse<Society> response = new ApiResponse<>(true, "Society retrieved successfully", society);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
     public ResponseEntity<ApiResponse<Society>> updateSociety(@PathVariable Integer id, @RequestBody Society updateSociety) {
        Society society = societyService.updateSociety(id, updateSociety);
        ApiResponse<Society> response = new ApiResponse<>(true, "Society updated successfully", society);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSociety(@PathVariable Integer id) {
        societyService.deleteSociety(id);
        ApiResponse<Void> response = new ApiResponse<>(true, "Society deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}
