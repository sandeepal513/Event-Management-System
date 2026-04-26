package com.university.event_management.repository;

import com.university.event_management.model.EventApproval;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventApprovalRepository extends JpaRepository<EventApproval, Integer> {

    List<EventApproval> findByStatus(String status);

    List<EventApproval> findByEventId(Integer eventId);

    List<EventApproval> findByStatusAndEventId(String status, Integer eventId);

    @Transactional
    void deleteByEventId(Integer eventId);

}
