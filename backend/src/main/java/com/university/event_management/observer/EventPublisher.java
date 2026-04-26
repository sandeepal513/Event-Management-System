package com.university.event_management.observer;

import com.university.event_management.model.Event;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.List;

@Component
public class EventPublisher {

    private final List<Observer> observers;

    @Autowired
    public EventPublisher(List<Observer> observers) {
        this.observers = observers;
    }

    public void notifyAllObservers(Event event) throws UnsupportedEncodingException {
        for (Observer observer : observers) {
            observer.update(event);
        }
    }
}
