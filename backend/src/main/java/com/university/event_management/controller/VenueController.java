package com.university.event_management.controller;

import com.university.event_management.model.Venue;
import com.university.event_management.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/venues")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @PostMapping("/add")
    public Venue addVenue(@RequestBody Venue venue) {
        return venueService.addVenue(venue);
    }

    @GetMapping("/all")
    public List<Venue> getAllVenues() {
        return venueService.getAllVenues();
    }

    @GetMapping("/{id}")
    public Venue getVenueById(@PathVariable Integer id) {
        return venueService.getVenueById(id);
    }

    @PutMapping("/update/{id}")
    public Venue updateVenue(@PathVariable Integer id, @RequestBody Venue venue) {
        return venueService.updateVenue(id, venue);
    }

    @DeleteMapping("/delete/{id}")
    public Venue deleteVenue(@PathVariable Integer id) {
        return venueService.deleteVenue(id);
    }
}
