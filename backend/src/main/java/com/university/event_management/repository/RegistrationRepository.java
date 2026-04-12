package com.university.event_management.repository;

import com.university.event_management.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Integer> {

    List<Registration> findByUserId(Integer userId);

    List<Registration> findByEventId(Integer eventId);

    List<Registration> findByStatus(String status);

    List<Registration> findByStatusAndEventTicketRequiredTrue(String status);

    boolean existsByUserIdAndEventId(Integer userId, Integer eventId);

}
