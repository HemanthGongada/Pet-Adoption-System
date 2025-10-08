//com.petadoption.service.PetService.java
package com.petadoption.service;

import com.petadoption.dto.PetDTO;
import com.petadoption.entity.Pet;
import com.petadoption.entity.User;
import com.petadoption.repository.PetRepository;
import com.petadoption.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetService {

    private static final Logger logger = LoggerFactory.getLogger(PetService.class);
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final String uploadDir = "./Uploads/";

    public PetService(PetRepository petRepository, UserRepository userRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        // Create upload directory if it doesn't exist
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            boolean created=directory.mkdirs();
            System.out.println("Upload directory created: " + created);

        }
        System.out.println("Upload directory path: " + directory.getAbsolutePath());

    }
    // Add this method to your existing PetService class
    public PetDTO getPetById(Long id) {
        try {
            logger.debug("Fetching pet with ID: {}", id);
            Pet pet = petRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + id));

            logger.debug("Found pet: {}", pet.getName());

            // Convert Pet entity to PetDTO
            PetDTO petDTO = new PetDTO();
            petDTO.setId(pet.getId());
            petDTO.setName(pet.getName());
            petDTO.setType(pet.getType());
            petDTO.setAge(pet.getAge());
            petDTO.setBreed(pet.getBreed());
            petDTO.setDescription(pet.getDescription());
            petDTO.setStatus(pet.getStatus());
            petDTO.setPhotoUrl(pet.getPhotoUrl());
            petDTO.setShelterId(pet.getShelter().getId());

            return petDTO;
        } catch (Exception e) {
            logger.error("Failed to fetch pet with ID: {}", id, e);
            throw new IllegalArgumentException("Pet not found with ID: " + id);
        }
    }

    public PetDTO addPet(PetDTO petDTO, MultipartFile photo) throws IOException {
        try {
            logger.debug("Adding pet: {}", petDTO.getName());
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.debug("Authenticated user: {}", email);
            User shelter = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));
            logger.debug("User role: {}", shelter.getRole().name());

            Pet pet = new Pet();
            pet.setName(petDTO.getName());
            pet.setType(petDTO.getType());
            pet.setAge(petDTO.getAge());
            pet.setBreed(petDTO.getBreed());
            pet.setDescription(petDTO.getDescription());
            pet.setStatus(petDTO.getStatus());
            pet.setShelter(shelter);

            if (photo != null && !photo.isEmpty()) {
                logger.debug("Uploading photo: {}", photo.getOriginalFilename());
                String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + fileName);
                Files.write(filePath, photo.getBytes());
                pet.setPhotoUrl("/uploads/" + fileName);
            } else {
                logger.debug("No photo provided for pet: {}", petDTO.getName());
            }

            Pet savedPet = petRepository.save(pet);
            logger.debug("Pet saved with ID: {}", savedPet.getId());

            PetDTO savedPetDTO = new PetDTO();
            savedPetDTO.setId(savedPet.getId());
            savedPetDTO.setName(savedPet.getName());
            savedPetDTO.setType(savedPet.getType());
            savedPetDTO.setAge(savedPet.getAge());
            savedPetDTO.setBreed(savedPet.getBreed());
            savedPetDTO.setDescription(savedPet.getDescription());
            savedPetDTO.setStatus(savedPet.getStatus());
            savedPetDTO.setPhotoUrl(savedPet.getPhotoUrl());
            savedPetDTO.setShelterId(savedPet.getShelter().getId());
            return savedPetDTO;
        } catch (IOException e) {
            logger.error("Failed to upload photo for pet: {}", petDTO.getName(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Failed to add pet: {}", petDTO.getName(), e);
            throw new RuntimeException("Failed to add pet", e);
        }
    }

    public List<PetDTO> getAllPets() {
        logger.debug("Fetching all pets");
        List<Pet> pets = petRepository.findAll();
        logger.debug("Found {} pets", pets.size());
        return pets.stream().map(pet -> {
            PetDTO petDTO = new PetDTO();
            petDTO.setId(pet.getId());
            petDTO.setName(pet.getName());
            petDTO.setType(pet.getType());
            petDTO.setAge(pet.getAge());
            petDTO.setBreed(pet.getBreed());
            petDTO.setDescription(pet.getDescription());
            petDTO.setStatus(pet.getStatus());
            petDTO.setPhotoUrl(pet.getPhotoUrl());
            petDTO.setShelterId(pet.getShelter().getId());
            return petDTO;
        }).collect(Collectors.toList());
    }

    public PetDTO updatePet(Long id, PetDTO petDTO, MultipartFile photo) throws IOException {
        try {
            logger.debug("Updating pet with ID: {}", id);
            Pet pet = petRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Pet not found"));
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.debug("Authenticated user: {}", email);
            User shelter = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));

            if (!pet.getShelter().getId().equals(shelter.getId())) {
                logger.error("User {} attempted to update pet ID {} owned by another shelter", email, id);
                throw new IllegalArgumentException("You can only update your own pets");
            }

            pet.setName(petDTO.getName());
            pet.setType(petDTO.getType());
            pet.setAge(petDTO.getAge());
            pet.setBreed(petDTO.getBreed());
            pet.setDescription(petDTO.getDescription());
            pet.setStatus(petDTO.getStatus());

            if (photo != null && !photo.isEmpty()) {
                logger.debug("Uploading new photo: {}", photo.getOriginalFilename());
                String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + fileName);
                Files.write(filePath, photo.getBytes());
                pet.setPhotoUrl("/uploads/" + fileName);
            }

            Pet updatedPet = petRepository.save(pet);
            logger.debug("Pet updated with ID: {}", updatedPet.getId());

            PetDTO updatedPetDTO = new PetDTO();
            updatedPetDTO.setId(updatedPet.getId());
            updatedPetDTO.setName(updatedPet.getName());
            updatedPetDTO.setType(updatedPet.getType());
            updatedPetDTO.setAge(updatedPet.getAge());
            updatedPetDTO.setBreed(updatedPet.getBreed());
            updatedPetDTO.setDescription(updatedPet.getDescription());
            updatedPetDTO.setStatus(updatedPet.getStatus());
            updatedPetDTO.setPhotoUrl(updatedPet.getPhotoUrl());
            updatedPetDTO.setShelterId(updatedPet.getShelter().getId());
            return updatedPetDTO;
        } catch (IOException e) {
            logger.error("Failed to upload photo for pet ID: {}", id, e);
            throw e;
        } catch (Exception e) {
            logger.error("Failed to update pet ID: {}", id, e);
            throw new RuntimeException("Failed to update pet", e);
        }
    }

    public void deletePet(Long id) {
        try {
            logger.debug("Deleting pet with ID: {}", id);
            Pet pet = petRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Pet not found"));
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.debug("Authenticated user: {}", email);
            User shelter = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Shelter not found"));

            if (!pet.getShelter().getId().equals(shelter.getId())) {
                logger.error("User {} attempted to delete pet ID {} owned by another shelter", email, id);
                throw new IllegalArgumentException("You can only delete your own pets");
            }

            petRepository.deleteById(id);
            logger.debug("Pet deleted with ID: {}", id);
        } catch (Exception e) {
            logger.error("Failed to delete pet ID: {}", id, e);
            throw new RuntimeException("Failed to delete pet", e);
        }
    }
}
