package com.petadoption.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "adoption_requests")
@Data
public class AdoptionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(nullable = false)
    private String status;

    // New relationship
    @OneToOne(mappedBy = "adoptionRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private Appointment appointment;

}