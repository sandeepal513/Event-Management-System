package com.university.event_management.service;

import com.university.event_management.model.Venue;
import com.university.event_management.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    public Venue addVenue(Venue adminVenue) {
        Venue venue = new Venue();
        venue.setName(adminVenue.getName());
        venue.setCapacity(adminVenue.getCapacity());
        venue.setDescription(adminVenue.getDescription());
        return venueRepository.save(venue);
    }

    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    public Venue getVenueById(Integer id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    public Venue updateVenue(Integer id, Venue updateVenue) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        venue.setName(updateVenue.getName());
        venue.setCapacity(updateVenue.getCapacity());
        venue.setDescription(updateVenue.getDescription());
        return venueRepository.save(venue);
    }

    public Venue deleteVenue(Integer id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        venueRepository.delete(venue);
        return venue;
    }
}
