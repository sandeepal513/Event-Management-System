package com.university.event_management.observer;

import com.university.event_management.model.Event;
import com.university.event_management.model.Role;
import com.university.event_management.model.User;
import com.university.event_management.repository.UserRepository;
import com.university.event_management.service.PublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.List;

@Component
public class EmailNotificationObserver implements Observer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PublicService publicService;

    @Override
    public void update(Event event) throws UnsupportedEncodingException {
        List<User> users = userRepository.findByRole(Role.student);

        for (User user : users) {
            System.out.println("Sending email to: " + user.getEmail() + " | New Event: " + event.getTitle());
            publicService.sendMail(user.getEmail(), "New Event: " + event.getTitle(),
                    "Dear " + user.getName() + ",\n\nA new event has been created: " + event.getTitle() +
                            "\nDescription: " + event.getDescription() +
                            "\nDate: " + event.getDate() +
                            "\n\nBest regards,\nUniversity Event Management System");
        }
    }
}
