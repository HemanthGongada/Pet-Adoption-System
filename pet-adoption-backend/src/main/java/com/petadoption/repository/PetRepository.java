package com.petadoption.repository;

import com.petadoption.entity.Pet;
import com.petadoption.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByShelterId(Long shelterId);
    List<Pet> findByShelter(User shelter);
}