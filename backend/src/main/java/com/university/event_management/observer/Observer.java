package com.university.event_management.observer;

import com.university.event_management.model.Event;

import java.io.UnsupportedEncodingException;

public interface Observer {
    void update(Event event) throws UnsupportedEncodingException;
}
