package com.petadoption.controller;

import com.petadoption.dto.UserDTO;
import com.petadoption.dto.UpdateProfileRequest;
import com.petadoption.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO userDTO = userService.getUserProfile(email);
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@Valid @RequestBody UpdateProfileRequest updateRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDTO updatedUser = userService.updateUserProfile(email, updateRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody UpdatePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/shelters")
    public ResponseEntity<List<UserDTO>> getShelters() {
        List<UserDTO> shelters = userService.getShelters().stream()
                .map(user -> {
                    UserDTO dto = new UserDTO();
                    dto.setId(user.getId());
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    dto.setRole(user.getRole().name());
                    dto.setAddress(user.getAddress());
                    dto.setCity(user.getCity());
                    dto.setState(user.getState());
                    dto.setZipCode(user.getZipCode());
                    dto.setContactEmail(user.getContactEmail());
                    dto.setContactNumber(user.getContactNumber());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(shelters);
    }
}

class UpdatePasswordRequest {
    private String currentPassword;
    private String newPassword;

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
