package com.petadoption.repository;

import com.petadoption.entity.Appointment;
import com.petadoption.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUser(User user);
    List<Appointment> findByShelter(User shelter);
}