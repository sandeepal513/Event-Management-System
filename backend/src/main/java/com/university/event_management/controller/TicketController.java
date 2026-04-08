package com.university.event_management.controller;

import com.university.event_management.model.Ticket;
import com.university.event_management.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // ─── ADMIN ──────────────────────────────────────

    // Admin manually creates ticket
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        try {
            Integer registrationId = Integer.parseInt(body.get("registrationId"));
            String ticketNumber    = body.get("ticketNumber");
            String qrCode          = body.get("qrCode");
            return ResponseEntity.ok(
                    ticketService.createTicket(registrationId, ticketNumber, qrCode)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Admin gets all tickets
    @GetMapping
    public ResponseEntity<List<Ticket>> getAll() {
        return ResponseEntity.ok(ticketService.getAll());
    }

    // Admin cancels ticket
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ticketService.cancel(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── USER ───────────────────────────────────────

    // Get ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ticketService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get ticket by registration ID
    @GetMapping("/registration/{registrationId}")
    public ResponseEntity<?> getByRegistration(
            @PathVariable Integer registrationId) {
        try {
            return ResponseEntity.ok(
                    ticketService.getByRegistrationId(registrationId)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}