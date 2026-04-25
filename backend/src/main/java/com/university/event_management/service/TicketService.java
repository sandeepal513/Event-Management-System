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

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        if (!"CONFIRMED".equals(reg.getStatus())) {
            throw new RuntimeException("Only confirmed registrations can create a ticket!");
        }

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

    public List<Ticket> getFiltered(String status, Integer eventId, String q) {
        String normalizedStatus = status == null ? null : status.trim().toUpperCase();
        String normalizedQuery = q == null ? "" : q.trim().toLowerCase();

        List<Ticket> base;
        if (normalizedStatus != null && !normalizedStatus.isEmpty() && eventId != null) {
            base = ticketRepo.findByStatusAndRegistrationEventId(normalizedStatus, eventId);
        } else if (normalizedStatus != null && !normalizedStatus.isEmpty()) {
            base = ticketRepo.findByStatus(normalizedStatus);
        } else if (eventId != null) {
            base = ticketRepo.findByRegistrationEventId(eventId);
        } else {
            base = ticketRepo.findAll();
        }

        return base.stream()
                .filter(ticket -> {
                    if (normalizedQuery.isEmpty()) {
                        return true;
                    }

                    String ticketNumber = ticket.getTicketNumber() == null ? "" : ticket.getTicketNumber().toLowerCase();
                    String studentName = ticket.getRegistration() != null
                            && ticket.getRegistration().getUser() != null
                            && ticket.getRegistration().getUser().getName() != null
                            ? ticket.getRegistration().getUser().getName().toLowerCase()
                            : "";
                    String eventTitle = ticket.getRegistration() != null
                            && ticket.getRegistration().getEvent() != null
                            && ticket.getRegistration().getEvent().getTitle() != null
                            ? ticket.getRegistration().getEvent().getTitle().toLowerCase()
                            : "";

                    return String.valueOf(ticket.getTicketId()).contains(normalizedQuery)
                            || ticketNumber.contains(normalizedQuery)
                            || studentName.contains(normalizedQuery)
                            || eventTitle.contains(normalizedQuery);
                })
                .sorted(Comparator.comparing(Ticket::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
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

        Registration registration = registrationRepo.findById(ticket.getRegistration().getId())
            .orElseThrow(() -> new RuntimeException("Registration not found"));

        registration.setStatus("REJECTED");
        registrationRepo.save(registration);

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

    public List<Map<String, Object>> getTicketSummary() {
        List<Event> events = eventRepo.findAll();
        List<Ticket> tickets = ticketRepo.findAll();
        LocalDate today = LocalDate.now();

        Map<Integer, Integer> createdByEvent = new HashMap<>();
        Map<Integer, Integer> activeByEvent = new HashMap<>();
        Map<Integer, Integer> cancelledByEvent = new HashMap<>();

        for (Ticket ticket : tickets) {
            Integer eventId = ticket.getRegistration() != null && ticket.getRegistration().getEvent() != null
                    ? ticket.getRegistration().getEvent().getId()
                    : null;

            if (eventId == null) continue;

            createdByEvent.put(eventId, createdByEvent.getOrDefault(eventId, 0) + 1);

            if ("CANCELLED".equals(ticket.getStatus())) {
                cancelledByEvent.put(eventId, cancelledByEvent.getOrDefault(eventId, 0) + 1);
            } else {
                activeByEvent.put(eventId, activeByEvent.getOrDefault(eventId, 0) + 1);
            }
        }

        return events.stream()
                .map(event -> {
                    Map<String, Object> row = new HashMap<>();
                    Integer eventId = event.getId();

                    row.put("id", eventId);
                    row.put("title", event.getTitle());
                    row.put("date", event.getDate());
                    row.put("time", event.getTime());
                    row.put("ticketsCount", event.getTicketsCount());
                    row.put("createdTickets", createdByEvent.getOrDefault(eventId, 0));
                    row.put("activeTickets", activeByEvent.getOrDefault(eventId, 0));
                    row.put("cancelledTickets", cancelledByEvent.getOrDefault(eventId, 0));
                    row.put("upcoming", event.getDate() != null && !event.getDate().isBefore(today));

                    return row;
                })
                .toList();
    }
}
