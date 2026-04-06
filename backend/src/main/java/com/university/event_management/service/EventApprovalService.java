package com.university.event_management.service;

import com.university.event_management.model.Event;
import com.university.event_management.model.EventApproval;
import com.university.event_management.repository.EventApprovalRepository;
import com.university.event_management.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventApprovalService {

    @Autowired
    private EventApprovalRepository eventApprovalRepo;

    @Autowired
    private EventRepository eventRepo;


    public EventApproval createEventApproval(Integer eventId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        EventApproval approval = new EventApproval();
        approval.setEvent(event);
        approval.setStatus("PENDING");
        return eventApprovalRepo.save(approval);

    }

    public List<EventApproval> getPending() {
        return eventApprovalRepo.findByStatus("PENDING");
    }

    public List<EventApproval> getApproved() {
        return eventApprovalRepo.findByStatus("APPROVED");
    }

    public List<EventApproval> getRejected() {
        return eventApprovalRepo.findByStatus("REJECTED");
    }

    public List<EventApproval> getAllApproval() {
        return eventApprovalRepo.findAll();
    }

    public EventApproval approve(Integer eventId) {
        EventApproval approval = eventApprovalRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        approval.setStatus("APPROVED");
        return eventApprovalRepo.save(approval);
    }

    public EventApproval reject(Integer eventId,String reason) {
        EventApproval approval = eventApprovalRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        approval.setStatus("REJECTED");
        approval.setReason(reason);
        return eventApprovalRepo.save(approval);
    }


}
