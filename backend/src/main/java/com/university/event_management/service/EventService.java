package com.university.event_management.service;

import com.university.event_management.model.*;
import com.university.event_management.repository.CategoryRepository;
import com.university.event_management.repository.EventRepository;
import com.university.event_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public Event addEvent(EventRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        User organizer = userRepository.findById(request.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (organizer.getRole() != Role.organizer) {
            throw new RuntimeException("User is not an organizer");
        }

        Event event = new Event();

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDate(LocalDateTime.from(request.getDate()));
        event.setCategory(category);
        event.setOrganizer(organizer);
        event.setVenue(request.getVenue());

        return eventRepository.save(event);
    }
}
