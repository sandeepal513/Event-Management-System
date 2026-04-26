package com.university.event_management.repository;

import com.university.event_management.model.Role;
import com.university.event_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface UserRepository extends JpaRepository<User, Integer> {
    User findByEmail(String email);

    List<User> findByRole(Role role);
}