//com.petadoption.controller.PetController.java
package com.petadoption.controller;

import com.petadoption.dto.PetDTO;
import com.petadoption.service.PetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }
    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Long id) {
        try {
            // You'll need to create this method in PetService
            PetDTO pet = petService.getPetById(id);
            return ResponseEntity.ok(pet);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping(value = "/add", consumes = "multipart/form-data")
    public ResponseEntity<PetDTO> addPet(
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            @RequestParam("age") Integer age,
            @RequestParam("breed") String breed,
            @RequestParam("description") String description,
            @RequestParam("status") String status,
            @RequestParam(value = "photo", required = false) MultipartFile photo) throws IOException {

        // Create PetDTO manually
        PetDTO petDTO = new PetDTO();
        petDTO.setName(name);
        petDTO.setType(type);
        petDTO.setAge(age);
        petDTO.setBreed(breed);
        petDTO.setDescription(description);
        petDTO.setStatus(status);

        System.out.println("Adding pet: " + name);

        PetDTO savedPet = petService.addPet(petDTO, photo);
        return ResponseEntity.ok(savedPet);
    }

    @GetMapping
    public ResponseEntity<List<PetDTO>> getAllPets() {
        return ResponseEntity.ok(petService.getAllPets());
    }

    @PutMapping(value = "/update/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<PetDTO> updatePet(
            @PathVariable Long id,
            @Valid @RequestPart("pet") PetDTO petDTO,
            @RequestPart(value = "photo", required = false) MultipartFile photo) throws IOException {
        PetDTO updatedPet = petService.updatePet(id, petDTO, photo);
        return ResponseEntity.ok(updatedPet);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return ResponseEntity.noContent().build();
    }

}
