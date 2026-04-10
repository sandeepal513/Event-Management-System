package com.university.event_management.repository;

import com.university.event_management.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByTitleContainingIgnoreCase(String keyword);
    List<Event> findByOrganizerId(Integer organizerId);
    List<Event> findByOrganizerIdAndTitleContainingIgnoreCase(Integer organizerId, String keyword);
    List<Event> findByCategoryName(String name);
    List<Event> findTop2ByDateAfterOrderByDateAsc(LocalDate date);
}
