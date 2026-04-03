package com.university.event_management.service;

import com.university.event_management.model.Registration;
import com.university.event_management.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationService {
    @Autowired
    private RegistrationRepository registrationRepository;

    public List<Registration> getAll(){
        return registrationRepository.findAll();
    }

    public Registration approve(int id){
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        registration.setStatus("CONFIRMED");
        return registrationRepository.save(registration);

    }

    public Registration reject(int id){
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        registration.setStatus("REJECTED");
        return registrationRepository.save(registration);
    }

}
