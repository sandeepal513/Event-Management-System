package com.university.event_management.controller;

import com.university.event_management.model.EventApproval;
import com.university.event_management.service.EventApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/event-approvals")
@CrossOrigin(origins = "http://localhost:5173")
public class EventApprovalController {

    @Autowired
    private EventApprovalService eventApprovalService;

    @PostMapping
    public ResponseEntity<EventApproval> createEventApproval(@RequestBody Map<String,Integer> body ){
        return ResponseEntity.ok(eventApprovalService.createEventApproval(body.get("event_id")));

    }

    @GetMapping("/pending")
    public ResponseEntity<List<EventApproval>> getPending(){
        return ResponseEntity.ok(eventApprovalService.getPending());
    }

    @GetMapping
    public ResponseEntity<List<EventApproval>> getAllApproved(){
        return ResponseEntity.ok(eventApprovalService.getAllApproval());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<EventApproval> approve(@PathVariable("id") Integer eventId){
        return ResponseEntity.ok(eventApprovalService.approve(eventId));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<EventApproval> reject(@PathVariable("id") Integer eventId,@RequestBody Map<String,String> body){
        return ResponseEntity.ok(eventApprovalService.reject(eventId,body.get("reason")));
    }

    @GetMapping("/approve")
    public ResponseEntity<List<EventApproval>> getApprove(){
        return ResponseEntity.ok(eventApprovalService.getApproved());
    }

    @GetMapping("/reject")
    public ResponseEntity<List<EventApproval>> getReject(){
        return ResponseEntity.ok(eventApprovalService.getRejected());
    }

}
