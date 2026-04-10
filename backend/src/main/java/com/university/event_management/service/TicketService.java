package com.university.event_management.service;

import com.university.event_management.model.Event;
import com.university.event_management.model.Registration;
import com.university.event_management.model.Ticket;
import com.university.event_management.repository.EventRepository;
import com.university.event_management.repository.RegistrationRepository;
import com.university.event_management.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepo;

    @Autowired
    private RegistrationRepository registrationRepo;

    @Autowired
    private EventRepository eventRepo;

    //Admin manually creates ticket
    @Transactional
    public Ticket createTicket(Integer registrationId, String ticketNumber, String qrCode) {
        Registration reg = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        if (ticketNumber == null || ticketNumber.trim().isEmpty()) {
            throw new RuntimeException("Ticket number is required!");
        }

        if(reg.getEvent().getTicketRequired() == null
        || !reg.getEvent().getTicketRequired()) {
            throw new RuntimeException("This event does not require a ticket!");
        }

        Event event = eventRepo.findById(reg.getEvent().getId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getTicketsCount() == null || event.getTicketsCount() <= 0) {
            throw new RuntimeException("No tickets available for this event!");
        }

        Ticket existingTicket = ticketRepo.findByRegistrationId(registrationId).orElse(null);

        if (existingTicket != null && !"CANCELLED".equalsIgnoreCase(existingTicket.getStatus())) {
            throw new RuntimeException("This ticket already exists!");
        }

        ticketRepo.findByTicketNumber(ticketNumber)
                .ifPresent(found -> {
                    // Allow same ticket record to be reactivated with its own number.
                    if (existingTicket == null || !found.getTicketId().equals(existingTicket.getTicketId())) {
                        throw new RuntimeException("Ticket number already exists!");
                    }
                });

        event.setTicketsCount(event.getTicketsCount() - 1);
        eventRepo.save(event);

        if (existingTicket != null) {
            existingTicket.setTicketNumber(ticketNumber);
            existingTicket.setQrCode(qrCode);
            existingTicket.setStatus("ACTIVE");
            return ticketRepo.save(existingTicket);
        }

        Ticket ticket = new Ticket();
        ticket.setRegistration(reg);
        ticket.setTicketNumber(ticketNumber);
        ticket.setQrCode(qrCode);
        ticket.setStatus("ACTIVE");
       return ticketRepo.save(ticket);



    }

    public Ticket updateTicket(Integer id, String ticketNumber, String qrCode) {
        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if ("CANCELLED".equals(ticket.getStatus())) {
            throw new RuntimeException("Cannot update a cancelled ticket!");
        }


        if (ticketNumber == null || ticketNumber.trim().isEmpty()) {
            throw new RuntimeException("Ticket number is required!");
        }

        ticketRepo.findByTicketNumber(ticketNumber)
                .ifPresent(existing -> {
                    if (!existing.getTicketId().equals(id)) {
                        throw new RuntimeException("Ticket number already exists!");
                    }
                });

        ticket.setTicketNumber(ticketNumber);
        ticket.setQrCode(qrCode);
        return ticketRepo.save(ticket);
    }

    // Admin gets all tickets
    public List<Ticket> getAll() {
        return ticketRepo.findAll();
    }

    // Admin cancels ticket
    @Transactional
    public Ticket cancel(Integer id) {
        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if ("CANCELLED".equals(ticket.getStatus())) {
            throw new RuntimeException("Ticket already cancelled!");
        }

        Event event = eventRepo.findById(ticket.getRegistration().getEvent().getId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setTicketsCount((event.getTicketsCount() == null ? 0 : event.getTicketsCount()) + 1);
        eventRepo.save(event);

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
