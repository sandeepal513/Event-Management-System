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

    private List<EventApproval> filterUpcomingEvents(List<EventApproval> approvals) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        return approvals.stream()
                .filter(approval -> approval.getEvent() != null && approval.getEvent().getDate() != null)
                .filter(approval -> {
                    Event event = approval.getEvent();

                    if (event.getDate().isAfter(today)) {
                        return true;
                    }

                    if (event.getDate().isEqual(today)) {
                        if (event.getTime() == null) {
                            return true;
                        }
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

    public List<EventApproval> getPending() {
        return getFiltered("PENDING", null, null);
    }

    public List<EventApproval> getApproved() {
        return getFiltered("APPROVED", null, null);
    }

    public List<EventApproval> getUpcomingApproved() {
        return getFiltered("APPROVED", null, null);
    }

    public List<EventApproval> getRejected() {
        return getFiltered("REJECTED", null, null);
    }

    public List<EventApproval> getAllApproval() {
        return getFiltered(null, null, null);
    }

    public List<EventApproval> getFiltered(String status, Integer eventId, String q) {
        String normalizedStatus = status == null ? null : status.trim().toUpperCase();
        String normalizedQuery = q == null ? "" : q.trim().toLowerCase();

        List<EventApproval> base;
        if (normalizedStatus != null && !normalizedStatus.isEmpty() && eventId != null) {
            base = eventApprovalRepo.findByStatusAndEventId(normalizedStatus, eventId);
        } else if (normalizedStatus != null && !normalizedStatus.isEmpty()) {
            base = eventApprovalRepo.findByStatus(normalizedStatus);
        } else if (eventId != null) {
            base = eventApprovalRepo.findByEventId(eventId);
        } else {
            base = eventApprovalRepo.findAll();
        }

        return filterUpcomingEvents(base).stream()
                .filter(approval -> {
                    if (normalizedQuery.isEmpty()) {
                        return true;
                    }

                    String eventTitle = approval.getEvent() != null && approval.getEvent().getTitle() != null
                            ? approval.getEvent().getTitle().toLowerCase()
                            : "";
                    String organizerName = approval.getEvent() != null
                            && approval.getEvent().getOrganizer() != null
                            && approval.getEvent().getOrganizer().getName() != null
                            ? approval.getEvent().getOrganizer().getName().toLowerCase()
                            : "";
                    String venueName = approval.getEvent() != null
                            && approval.getEvent().getVenue() != null
                            && approval.getEvent().getVenue().getName() != null
                            ? approval.getEvent().getVenue().getName().toLowerCase()
                            : "";
                    String categoryName = approval.getEvent() != null
                            && approval.getEvent().getCategory() != null
                            && approval.getEvent().getCategory().getName() != null
                            ? approval.getEvent().getCategory().getName().toLowerCase()
                            : "";

                    return String.valueOf(approval.getId()).contains(normalizedQuery)
                            || eventTitle.contains(normalizedQuery)
                            || organizerName.contains(normalizedQuery)
                            || venueName.contains(normalizedQuery)
                            || categoryName.contains(normalizedQuery);
                })
                .collect(Collectors.toList());
    }

    public EventApproval approve(Integer eventId) {
        EventApproval approval = eventApprovalRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        approval.setStatus("APPROVED");
        return eventApprovalRepo.save(approval);
    }

    public EventApproval reject(Integer eventId,String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        EventApproval approval = eventApprovalRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        approval.setStatus("REJECTED");
        approval.setReason(reason.trim());
        return eventApprovalRepo.save(approval);
    }


}
