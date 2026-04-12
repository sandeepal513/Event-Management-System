package com.university.event_management.service;

import com.university.event_management.model.Event;
import com.university.event_management.model.Registration;
import com.university.event_management.model.User;
import com.university.event_management.repository.EventRepository;
import com.university.event_management.repository.RegistrationRepository;
import com.university.event_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class  RegistrationService {
    @Autowired
    private RegistrationRepository registrationRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private EventRepository eventRepo;

    //-----student-------

    //sees all events
    public List<Event> getAllEvents() {
        return eventRepo.findAll();
    }

    //Student register fot event
    public Registration register(Integer userId, Integer eventId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (registrationRepo.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("You have already registered for this event!");
        }

        // ← Block if event does not require ticket
        if (event.getTicketRequired() == null || !event.getTicketRequired()) {
            throw new RuntimeException("This event does not require registration!");
        }

        // ← Block if no tickets available
        if (event.getTicketsCount() == null || event.getTicketsCount() <= 0) {
            throw new RuntimeException("No tickets available!");
        }

        Registration reg =  new Registration();
        reg.setUser(user);
        reg.setEvent(event);
        reg.setStatus("PENDING");
        return  registrationRepo.save(reg);
    }

    //Student cancel their registration
    public void cancel (Integer id){
        Registration reg = registrationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        if (!reg.getStatus().equals("PENDING")) {
            throw new RuntimeException("Cannot cancel approved registration!");
        }
        registrationRepo.deleteById(id);
    }

    //Student sees their own registrations
    public List<Registration> getByUser(Integer userId) {
        return registrationRepo.findByUserId(userId);
    }

    //-----Admin---------

    //Admin sees all registrations
    public List<Registration> getAll(){
        return registrationRepo.findAll();
    }

    public List<Registration> getConfirmed() {
        return registrationRepo.findByStatus("CONFIRMED");
    }

    public List<Registration> getConfirmedTicketRequired() {
        return registrationRepo.findByStatusAndEventTicketRequiredTrue("CONFIRMED");
    }

    //Admin sees registration by event
    public List<Registration> getByEventId(Integer eventId) {
        return registrationRepo.findByEventId(eventId);
    }

    //Admin approves registration
    public Registration approve(Integer id){
        Registration reg = registrationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        reg.setStatus("CONFIRMED");
        return registrationRepo.save(reg);

    }

    //Admin rejects registration
    public Registration reject(Integer id){
        Registration registration = registrationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        registration.setStatus("REJECTED");
        return registrationRepo.save(registration);
    }

}
