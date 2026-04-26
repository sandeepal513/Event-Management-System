package com.university.event_management.service;

import com.university.event_management.model.Society;
import com.university.event_management.repository.SocietyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SocietyService {

    @Autowired
    private SocietyRepository societyRepository;

    public Society createSociety(Society society) {
        return societyRepository.save(society);
    }

    public List<Society> getSocieties() {
        return societyRepository.findAll();
    }

    public Society getSociety(Integer id) {
        return societyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(("Society not found with id: " + id)));
    }

    public Society updateSociety(Integer id, Society updateSociety) {
        Society society = societyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(("Society not found with id: " + id)));

        updateSociety.setId(id);
        return societyRepository.save(updateSociety);
    }

    public void deleteSociety(Integer id) {
        Society society = societyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(("Society not found with id: " + id)));

        societyRepository.delete(society);
    }
}
