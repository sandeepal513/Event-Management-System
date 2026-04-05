package com.university.event_management.service;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.mail.internet.InternetAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class PublicService {

    @Autowired
    private JavaMailSender mailSender;

    private Dotenv dotenv = Dotenv.load();

    public void sendMail(String to, String subject, String body) throws UnsupportedEncodingException {

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(String.valueOf(new InternetAddress(dotenv.get("SYSTEM_EMAIL"), "EventOra Team")));
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);

        mailSender.send(msg);
    }
}
