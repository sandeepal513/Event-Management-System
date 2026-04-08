package com.university.event_management.repository;

import com.university.event_management.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket,Integer> {

    Optional<Ticket> findByRegistrationId(Integer regId);

    List<Ticket> findAll();


}
