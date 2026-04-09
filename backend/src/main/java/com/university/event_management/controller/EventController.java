package com.university.event_management.controller;

import com.university.event_management.model.Event;
import com.university.event_management.model.EventRequest;
import com.university.event_management.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping("/add")
    public Event addEvent(@RequestBody EventRequest request) {
        return eventService.addEvent(request);
    }

    @GetMapping("/all")
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Integer id) {
        return eventService.getEventById(id);
    }

    @PutMapping("/update/{id}")
    public Event updateEvent(@PathVariable Integer id, @RequestBody EventRequest request) {
        return eventService.updateEvent(id, request);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteEvent(@PathVariable Integer id) {
        eventService.deleteEvent(id);
    }

    @GetMapping("/organizer/{organizerId}")
    public List<Event> getEventsByOrganizer(@PathVariable Integer organizerId) {
        return eventService.searchEventsByOrganizer(organizerId, null);
    }

    @GetMapping("/organizer/{organizerId}/search")
    public List<Event> searchEventsByOrganizer(@PathVariable Integer organizerId, @RequestParam String keyword) {
        return eventService.searchEventsByOrganizer(organizerId, keyword);
    }
}
