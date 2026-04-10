package com.university.event_management.service;

import com.university.event_management.model.Event;
import com.university.event_management.model.EventApproval;
import com.university.event_management.repository.EventApprovalRepository;
import com.university.event_management.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

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

    public List<EventApproval> getUpcomingApproved() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        return eventApprovalRepo.findByStatus("APPROVED").stream()
                .filter(approval -> approval.getEvent() != null && approval.getEvent().getDate() != null)
                .filter(approval -> {
                    Event event = approval.getEvent();

                    if (event.getDate().isAfter(today)) {
                        return true;
                    }

                    if (event.getDate().isEqual(today) && event.getTime() != null) {
                        return !event.getTime().toLocalTime().isBefore(now);
                    }

                    return false;
                })
                .sorted((left, right) -> {
                    Event leftEvent = left.getEvent();
                    Event rightEvent = right.getEvent();

                    int dateCompare = leftEvent.getDate().compareTo(rightEvent.getDate());
                    if (dateCompare != 0) {
                        return dateCompare;
                    }

                    if (leftEvent.getTime() == null && rightEvent.getTime() == null) {
                        return 0;
                    }

                    if (leftEvent.getTime() == null) {
                        return 1;
                    }

                    if (rightEvent.getTime() == null) {
                        return -1;
                    }

                    return leftEvent.getTime().compareTo(rightEvent.getTime());
                })
                .collect(Collectors.toList());
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
