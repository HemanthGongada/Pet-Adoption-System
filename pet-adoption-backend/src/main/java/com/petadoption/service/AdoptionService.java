package com.petadoption.service;

import com.petadoption.dto.AdoptionRequestDTO;
import com.petadoption.entity.AdoptionRequest;
import com.petadoption.entity.Pet;
import com.petadoption.entity.User;
import com.petadoption.exception.ResourceNotFoundException;
import com.petadoption.exception.UnauthorizedException;
import com.petadoption.repository.AdoptionRequestRepository;
import com.petadoption.repository.PetRepository;
import com.petadoption.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdoptionService {

    private final AdoptionRequestRepository adoptionRequestRepository;
    private final UserRepository userRepository;
    private final PetRepository petRepository;

    public AdoptionService(AdoptionRequestRepository adoptionRequestRepository,
                           UserRepository userRepository,
                           PetRepository petRepository) {
        this.adoptionRequestRepository = adoptionRequestRepository;
        this.userRepository = userRepository;
        this.petRepository = petRepository;
    }

    // CREATE adoption request
    public AdoptionRequestDTO createAdoptionRequest(AdoptionRequestDTO requestDTO, String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Pet pet = petRepository.findById(requestDTO.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        AdoptionRequest adoptionRequest = new AdoptionRequest();
        adoptionRequest.setUser(user);
        adoptionRequest.setPet(pet);
        adoptionRequest.setStatus("PENDING");

        adoptionRequest = adoptionRequestRepository.save(adoptionRequest);
        return mapToDTO(adoptionRequest);
    }

    // GET user's adoption requests - ADD THIS METHOD
    public List<AdoptionRequestDTO> getUserAdoptionRequests(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return adoptionRequestRepository.findByUser(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // GET adoption requests by pet (for shelter)
    public List<AdoptionRequestDTO> getAdoptionRequestsByPet(Long petId, String username) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Allow shelter to view requests for their own pets AND admin to view all
        if (!pet.getShelter().getId().equals(user.getId()) && !user.getRole().equals(User.Role.ADMIN)) {
            throw new UnauthorizedException("You are not authorized to view these requests");
        }

        return adoptionRequestRepository.findByPet(pet).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // GET all adoption requests (for admin and shelter)
    public List<AdoptionRequestDTO> getAllAdoptionRequests(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<AdoptionRequest> requests;

        if (user.getRole().equals(User.Role.ADMIN)) {
            // Admin can see all requests
            requests = adoptionRequestRepository.findAll();
            System.out.println("Admin fetching ALL requests: " + requests.size());
        } else if (user.getRole().equals(User.Role.SHELTER)) {
            // Shelter can see requests for pets they own
            // First, get all pets owned by this shelter
            List<Pet> shelterPets = petRepository.findByShelterId(user.getId());
            System.out.println("Shelter " + user.getId() + " owns " + shelterPets.size() + " pets");

            // Get all adoption requests for these pets
            requests = new ArrayList<>();
            for (Pet pet : shelterPets) {
                List<AdoptionRequest> petRequests = adoptionRequestRepository.findByPet(pet);
                requests.addAll(petRequests);
                System.out.println("Pet " + pet.getId() + " has " + petRequests.size() + " requests");
            }

            System.out.println("Shelter can see " + requests.size() + " total requests");
        } else {
            throw new UnauthorizedException("You are not authorized to view all requests");
        }

        return requests.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    // UPDATE adoption request status
    public AdoptionRequestDTO updateAdoptionRequestStatus(Long id, String status, String username) {
        AdoptionRequest request = adoptionRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adoption request not found"));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        System.out.println("=== ADOPTION REQUEST UPDATE DEBUG ===");
        System.out.println("User: " + username + " (Role: " + user.getRole() + ", ID: " + user.getId() + ")");
        System.out.println("Request ID: " + id);
        System.out.println("Pet ID: " + request.getPet().getId());
        System.out.println("Pet Shelter ID: " + request.getPet().getShelter().getId());
        System.out.println("Pet Shelter Name: " + request.getPet().getShelter().getName());

        // Check authorization
        boolean isAuthorized = false;

        if (user.getRole().equals(User.Role.ADMIN)) {
            // Admin can update any request
            isAuthorized = true;
            System.out.println("Admin authorized to update any request");
        } else if (user.getRole().equals(User.Role.SHELTER)) {
            // Shelter can update requests for their own pets
            boolean ownsPet = request.getPet().getShelter().getId().equals(user.getId());
            isAuthorized = ownsPet;
            System.out.println("Shelter owns pet: " + ownsPet);
            System.out.println("Shelter authorized: " + isAuthorized);
        }

        System.out.println("Final authorization: " + isAuthorized);
        System.out.println("=== END DEBUG ===");

        if (!isAuthorized) {
            throw new UnauthorizedException("You are not authorized to update this request. " +
                    "Shelters can only update requests for pets they own.");
        }

        request.setStatus(status);
        request = adoptionRequestRepository.save(request);

        System.out.println("Adoption request " + id + " updated to status: " + status + " by user: " + username);

        return mapToDTO(request);
    }


    // MAP entity to DTO
    private AdoptionRequestDTO mapToDTO(AdoptionRequest request) {
        AdoptionRequestDTO dto = new AdoptionRequestDTO();
        dto.setId(request.getId());
        dto.setUserId(request.getUser().getId());
        dto.setPetId(request.getPet().getId());
        dto.setStatus(request.getStatus());
        return dto;
    }
}
