package com.petadoption.controller;

import com.petadoption.dto.AdoptionRequestDTO;
import com.petadoption.service.AdoptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adoptions")
public class AdoptionController {

    private final AdoptionService adoptionService;

    public AdoptionController(AdoptionService adoptionService) {
        this.adoptionService = adoptionService;
    }

    @PostMapping("/create")
    public ResponseEntity<AdoptionRequestDTO> createAdoptionRequest(@RequestBody AdoptionRequestDTO requestDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(adoptionService.createAdoptionRequest(requestDTO, username));
    }

    @GetMapping("/user")
    public ResponseEntity<List<AdoptionRequestDTO>> getUserAdoptionRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(adoptionService.getUserAdoptionRequests(username));
    }

    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<AdoptionRequestDTO>> getAdoptionRequestsByPet(@PathVariable Long petId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(adoptionService.getAdoptionRequestsByPet(petId, username));
    }

    @GetMapping("/manage/all")
    public ResponseEntity<List<AdoptionRequestDTO>> getAllAdoptionRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(adoptionService.getAllAdoptionRequests(username));
    }

    @PutMapping("/manage/{id}")
    public ResponseEntity<AdoptionRequestDTO> updateAdoptionRequestStatus(@PathVariable Long id,
                                                                          @RequestBody AdoptionRequestDTO requestDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(adoptionService.updateAdoptionRequestStatus(id, requestDTO.getStatus(), username));
    }

}
