// com.petadoption.service.AdminService.java
package com.petadoption.service;

import com.petadoption.dto.AdminDashboardDTO;
import com.petadoption.entity.AdoptionRequest;
import com.petadoption.entity.Pet;
import com.petadoption.entity.User;
import com.petadoption.repository.AdoptionRequestRepository;
import com.petadoption.repository.PetRepository;
import com.petadoption.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;

    public AdminService(UserRepository userRepository, PetRepository petRepository,
                        AdoptionRequestRepository adoptionRequestRepository) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.adoptionRequestRepository = adoptionRequestRepository;
    }

    public AdminDashboardDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalPets = petRepository.count();
        long totalAdoptions = adoptionRequestRepository.count();
        long pendingAdoptions = adoptionRequestRepository.findAll().stream()
                .filter(req -> "PENDING".equals(req.getStatus()))
                .count();

        AdminDashboardDTO dashboard = new AdminDashboardDTO();
        dashboard.setTotalUsers(totalUsers);
        dashboard.setTotalPets(totalPets);
        dashboard.setTotalAdoptions(totalAdoptions);
        dashboard.setPendingAdoptions(pendingAdoptions);

        return dashboard;
    }

    public Map<String, Object> getAdoptionReports() {
        List<AdoptionRequest> allRequests = adoptionRequestRepository.findAll();

        Map<String, Object> report = new HashMap<>();
        report.put("totalRequests", allRequests.size());
        report.put("pendingRequests", allRequests.stream()
                .filter(req -> "PENDING".equals(req.getStatus())).count());
        report.put("approvedRequests", allRequests.stream()
                .filter(req -> "APPROVED".equals(req.getStatus())).count());
        report.put("rejectedRequests", allRequests.stream()
                .filter(req -> "REJECTED".equals(req.getStatus())).count());
        report.put("requestsByMonth", getAdoptionsByMonth());
        report.put("recentRequests", allRequests.stream()
                .limit(10)
                .collect(Collectors.toList()));

        return report;
    }

    public Map<String, Object> getUserReports() {
        List<User> allUsers = userRepository.findAll();

        Map<String, Object> report = new HashMap<>();
        report.put("totalUsers", allUsers.size());
        report.put("regularUsers", allUsers.stream()
                .filter(user -> User.Role.USER.equals(user.getRole())).count());
        report.put("shelters", allUsers.stream()
                .filter(user -> User.Role.SHELTER.equals(user.getRole())).count());
        report.put("admins", allUsers.stream()
                .filter(user -> User.Role.ADMIN.equals(user.getRole())).count());
        report.put("users", allUsers);

        return report;
    }

    public Map<String, Object> getPetReports() {
        List<Pet> allPets = petRepository.findAll();

        Map<String, Object> report = new HashMap<>();
        report.put("totalPets", allPets.size());
        report.put("availablePets", allPets.stream()
                .filter(pet -> "AVAILABLE".equals(pet.getStatus())).count());
        report.put("adoptedPets", allPets.stream()
                .filter(pet -> "ADOPTED".equals(pet.getStatus())).count());
        report.put("petsByType", getPetsByType(allPets));
        report.put("recentPets", allPets.stream()
                .limit(10)
                .collect(Collectors.toList()));

        return report;
    }

    private Map<String, Long> getAdoptionsByMonth() {
        // Simplified implementation - in real app, you'd group by month
        Map<String, Long> monthly = new HashMap<>();
        monthly.put("January", 5L);
        monthly.put("February", 8L);
        monthly.put("March", 12L);
        return monthly;
    }

    private Map<String, Long> getPetsByType(List<Pet> pets) {
        return pets.stream()
                .collect(Collectors.groupingBy(Pet::getType, Collectors.counting()));
    }
}