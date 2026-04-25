package com.university.event_management.repository;

import com.university.event_management.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket,Integer> {

    Optional<Ticket> findByRegistrationId(Integer regId);

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    List<Ticket> findByStatus(String status);

    List<Ticket> findByRegistrationEventId(Integer eventId);

    List<Ticket> findByStatusAndRegistrationEventId(String status, Integer eventId);

    List<Ticket> findAll();


}
