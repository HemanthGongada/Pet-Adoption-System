// com.petadoption.controller.AdminController.java
package com.petadoption.controller;

import com.petadoption.dto.AdminDashboardDTO;
import com.petadoption.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/reports/adoptions")
    public ResponseEntity<?> getAdoptionReports() {
        return ResponseEntity.ok(adminService.getAdoptionReports());
    }

    @GetMapping("/reports/users")
    public ResponseEntity<?> getUserReports() {
        return ResponseEntity.ok(adminService.getUserReports());
    }

    @GetMapping("/reports/pets")
    public ResponseEntity<?> getPetReports() {
        return ResponseEntity.ok(adminService.getPetReports());
    }
}
