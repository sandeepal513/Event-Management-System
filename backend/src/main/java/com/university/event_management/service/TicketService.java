package com.university.event_management.service;

import com.university.event_management.model.Registration;
import com.university.event_management.model.Society;
import com.university.event_management.model.Ticket;
import com.university.event_management.repository.RegistrationRepository;
import com.university.event_management.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepo;

    @Autowired
    private RegistrationRepository registrationRepo;

    //Admin manually creates ticket
    public Ticket createTicket(Integer registrationId, String ticketNumber, String qrCode) {
        Registration reg = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        if(reg.getEvent().getTicketRequired() == null
        || !reg.getEvent().getTicketRequired()) {
            throw new RuntimeException("This event does not require a ticket!");
        }

        if(ticketRepo.findByRegistrationId(registrationId).isPresent()) {
            throw new RuntimeException("This ticket already exists!");
        }

        Ticket ticket = new Ticket();
        ticket.setRegistration(reg);
        ticket.setTicketNumber(ticketNumber);
        ticket.setQrCode(qrCode);
        ticket.setStatus("ACTIVE");
       return ticketRepo.save(ticket);



    }

    // Admin gets all tickets
    public List<Ticket> getAll() {
        return ticketRepo.findAll();
    }

    // Admin cancels ticket
    public Ticket cancel(Integer id) {
        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus("CANCELLED");
        return ticketRepo.save(ticket);
    }

    // ─── USER ───────────────────────────────────────

    // Get ticket by ID
    public Ticket getById(Integer id) {
        return ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    // Get ticket by registration ID
    public Ticket getByRegistrationId(Integer registrationId) {
        return ticketRepo.findByRegistrationId(registrationId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }
}
