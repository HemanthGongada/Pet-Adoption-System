//com.petadoption.repository.AdoptionRequestRepository.java
package com.petadoption.repository;

import com.petadoption.entity.AdoptionRequest;
import com.petadoption.entity.Pet;
import com.petadoption.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {
    List<AdoptionRequest> findByUser(User user);
    List<AdoptionRequest> findByPet(Pet pet);
    // In AdoptionRequestRepository.java
    List<AdoptionRequest> findByPet_ShelterId(Long shelterId);
    long countByStatus(String status);

}
