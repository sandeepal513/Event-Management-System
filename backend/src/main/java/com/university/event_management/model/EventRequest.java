package com.university.event_management.model;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventRequest {
    private String title;
    private String description;
    private String venue;
    private java.time.LocalDate date;

    private Integer categoryId;
    private Integer organizerId;

}
