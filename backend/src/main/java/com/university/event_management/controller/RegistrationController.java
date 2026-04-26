package com.university.event_management.controller;

import com.university.event_management.model.Event;
import com.university.event_management.model.Registration;
import com.university.event_management.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/registration")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    //---------student-------------

    //student sees all event
    @GetMapping("/all")
    public List<Event> getAllEvents() {
        return registrationService.getAllEvents();
    }

    //Student register for event
    @PostMapping
    public ResponseEntity<Registration> register(@RequestBody Map<String,Integer> body) {
        return ResponseEntity.ok(registrationService.register(
                body.get("userId"),
                body.get("eventId")
        ));
    }

    //Student sees their registrations
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Registration>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(registrationService.getByUser(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Integer id) {
        registrationService.cancel(id);
        return ResponseEntity.noContent().build();
    }

    //------------Admin---------------

    //Admin sees all registrations
    @GetMapping
    public ResponseEntity<List<Registration>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(registrationService.getFiltered(status, eventId, q));
    }

    @GetMapping("/confirmed")
    public ResponseEntity<List<Registration>> getConfirmed() {
        return ResponseEntity.ok(registrationService.getConfirmed());
    }

    @GetMapping("/confirmed-ticket-required")
    public ResponseEntity<List<Registration>> getConfirmedTicketRequired() {
        return ResponseEntity.ok(registrationService.getConfirmedTicketRequired());
    }

    //Admin sees registration by event
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Registration>> getByEventId(@PathVariable Integer eventId) {
        return ResponseEntity.ok(registrationService.getByEventId(eventId));
    }

    //admin approves
    @PostMapping("/{id}/approve")
    public ResponseEntity<Registration> approve(@PathVariable Integer id) {
        return ResponseEntity.ok(registrationService.approve(id));
    }

    //Admin rejects
    @PostMapping("/{id}/reject")
    public ResponseEntity<Registration> reject(@PathVariable Integer id) {
        return ResponseEntity.ok(registrationService.reject(id));
    }


}
