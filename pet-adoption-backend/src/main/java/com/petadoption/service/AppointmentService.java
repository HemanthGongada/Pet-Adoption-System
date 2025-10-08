package com.petadoption.service;

import com.petadoption.dto.AppointmentDTO;
import com.petadoption.entity.Appointment;
import com.petadoption.entity.AdoptionRequest;
import com.petadoption.entity.User;
import com.petadoption.exception.ResourceNotFoundException;
import com.petadoption.exception.UnauthorizedException;
import com.petadoption.repository.AdoptionRequestRepository;
import com.petadoption.repository.AppointmentRepository;
import com.petadoption.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              AdoptionRequestRepository adoptionRequestRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.adoptionRequestRepository = adoptionRequestRepository;
    }

    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO, String username) {
        logger.debug("Creating appointment for user: {}", username);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User shelter = userRepository.findById(appointmentDTO.getShelterId())
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found"));
        AdoptionRequest adoptionRequest = adoptionRequestRepository.findById(appointmentDTO.getAdoptionRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Adoption request not found"));

        if (!adoptionRequest.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only book appointments for your own adoption requests");
        }
        if (!adoptionRequest.getStatus().equals("APPROVED")) {
            throw new IllegalArgumentException("Appointments can only be booked for approved adoption requests");
        }
        if (adoptionRequest.getAppointment() != null) {
            throw new IllegalArgumentException("An appointment already exists for this adoption request");
        }

        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setShelter(shelter);
        appointment.setAdoptionRequest(adoptionRequest);
        appointment.setVisitorName(appointmentDTO.getVisitorName());
        appointment.setNumberOfVisitors(appointmentDTO.getNumberOfVisitors());
        appointment.setAppointmentDateTime(appointmentDTO.getAppointmentDateTime());
        appointment.setStatus(Appointment.Status.PENDING);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        logger.debug("Appointment created with ID: {}", savedAppointment.getId());
        return mapToDTO(savedAppointment);
    }

    public List<AppointmentDTO> getUserAppointments(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return appointmentRepository.findByUser(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getShelterAppointments(String username) {
        User shelter = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found"));
        if (!shelter.getRole().equals(User.Role.SHELTER) && !shelter.getRole().equals(User.Role.ADMIN)) {
            throw new UnauthorizedException("Only shelters and admins can view shelter appointments");
        }
        return appointmentRepository.findByShelter(shelter).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO updateAppointmentStatus(Long id, String status, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().equals(User.Role.ADMIN) && !appointment.getShelter().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to update this appointment");
        }

        try {
            appointment.setStatus(Appointment.Status.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid appointment status: " + status);
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        logger.debug("Appointment {} updated to status: {} by user: {}", id, status, username);
        return mapToDTO(updatedAppointment);
    }

    private AppointmentDTO mapToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setUserId(appointment.getUser().getId());
        dto.setShelterId(appointment.getShelter().getId());
        dto.setAdoptionRequestId(appointment.getAdoptionRequest().getId());
        dto.setVisitorName(appointment.getVisitorName());
        dto.setNumberOfVisitors(appointment.getNumberOfVisitors());
        dto.setAppointmentDateTime(appointment.getAppointmentDateTime());
        dto.setStatus(appointment.getStatus().name());
        return dto;
    }
}
