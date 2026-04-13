package com.university.event_management.service;

import com.university.event_management.model.*;
import com.university.event_management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private SocietyRepository societyRepository;

    @Autowired
    private EventApprovalRepository eventApprovalRepository;

    public Event addEvent(EventRequest request) {

        User organizer = userRepository.findById(request.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Society society = societyRepository.findById(request.getSocietyId())
                .orElseThrow(() -> new RuntimeException("Society not found"));

         Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        if (organizer.getRole() != Role.organizer) {
            throw new RuntimeException("User is not an organizer");
        }

        Event event = new Event();

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setTicketRequired(request.getTicketRequired());
        event.setTicketsCount(request.getTicketsCount());
        event.setImageUrl(request.getImageUrl());
        event.setCategory(category);
        event.setOrganizer(organizer);
        event.setVenue(venue);
        event.setSociety(society);

       // return eventRepository.save(event);

        Event savedEvent = eventRepository.save(event);

        EventApproval approval = new EventApproval();
        approval.setEvent(savedEvent);
        approval.setStatus("PENDING");
        eventApprovalRepository.save(approval);

        return savedEvent;

    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Integer id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Event updateEvent(Integer id, EventRequest request) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User organizer = event.getOrganizer();
        if (request.getOrganizerId() != null) {
            organizer = userRepository.findById(request.getOrganizerId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (organizer.getRole() != Role.organizer) {
                throw new RuntimeException("User is not an organizer");
            }
        }

        Category category = event.getCategory();
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Society society = event.getSociety();
        if (request.getSocietyId() != null) {
            society = societyRepository.findById(request.getSocietyId())
                    .orElseThrow(() -> new RuntimeException("Society not found"));
        }

        Venue venue = event.getVenue();
        if (request.getVenueId() != null) {
            venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found"));
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setTicketRequired(request.getTicketRequired());
        event.setTicketsCount(request.getTicketsCount());
        event.setImageUrl(request.getImageUrl());
        event.setCategory(category);
        event.setOrganizer(organizer);
        event.setVenue(venue);
        event.setSociety(society);

        return eventRepository.save(event);
    }

    public Event deleteEvent(Integer id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        eventRepository.delete(event);
        return event;
    }

    public List<Event> searchEventsByOrganizer(Integer organizerId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return eventRepository.findByOrganizerId(organizerId);
        }
        return eventRepository.findByOrganizerIdAndTitleContainingIgnoreCase(organizerId, keyword);
    }

    public List<Event> getEventsByCategory(String categoryName) {
        return eventRepository.findByCategoryName(categoryName);
    }

    public List<Event> getUpComingEvents(){
        return eventRepository.findTop2ByDateAfterOrderByDateAsc(LocalDate.now());
    }

    public Map<String, Object> getStats(){
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalEvents", eventRepository.count());
        stats.put("upcomingEvents", eventRepository.countByDateAfter(LocalDate.now()));
        stats.put("totalUsers", userRepository.count());

        return stats;
    }
}
