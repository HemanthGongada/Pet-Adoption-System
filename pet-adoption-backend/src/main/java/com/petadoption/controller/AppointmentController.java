package com.petadoption.controller;

import com.petadoption.dto.AppointmentDTO;
import com.petadoption.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/create")
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(appointmentService.createAppointment(appointmentDTO, username));
    }

    @GetMapping("/user")
    public ResponseEntity<List<AppointmentDTO>> getUserAppointments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(appointmentService.getUserAppointments(username));
    }

    @GetMapping("/shelter")
    public ResponseEntity<List<AppointmentDTO>> getShelterAppointments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(appointmentService.getShelterAppointments(username));
    }

    @PutMapping("/manage/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointmentStatus(@PathVariable Long id, @RequestBody AppointmentDTO appointmentDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, appointmentDTO.getStatus(), username));
    }
}
