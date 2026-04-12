package com.university.event_management.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String phoneNo;

    @Column(nullable = true)
    private String image;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role = Role.student;

    private Boolean verifyEmail;

    @Column(name = "create_at", updatable = false)
    private LocalDateTime createAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (role == null) {
            role = Role.student ;
        }
        if (createAt == null) {
            createAt = LocalDateTime.now();
        }
        verifyEmail = false;
    }
}