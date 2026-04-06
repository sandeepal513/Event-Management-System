package com.university.event_management.model;


import lombok.Getter;
import lombok.Setter;

import java.sql.Time;

@Getter
@Setter
public class EventRequest {
    private String title;
    private String description;
    private String venue;
    private java.time.LocalDate date;
    private Time time;
    private Boolean ticketRequired;
    private Integer ticketsCount;

    private Integer categoryId;
    private Integer organizerId;
    private Integer venueId;
    private Integer societyId;

}
