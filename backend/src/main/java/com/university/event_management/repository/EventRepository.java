package com.university.event_management.repository;

import com.university.event_management.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByTitleContainingIgnoreCase(String keyword);
}
