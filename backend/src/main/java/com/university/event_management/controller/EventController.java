package com.university.event_management.controller;

import com.university.event_management.model.Event;
import com.university.event_management.model.EventRequest;
import com.university.event_management.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping("/add")
    public Event addEvent(@RequestBody EventRequest request) {
        return eventService.addEvent(request);
    }
}
