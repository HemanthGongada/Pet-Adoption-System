package com.petadoption.service;

import com.petadoption.dto.UserDTO;
import com.petadoption.dto.UpdateProfileRequest;
import com.petadoption.entity.User;
import com.petadoption.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO registerUser(UserDTO userDTO) {
        if (userDTO.getPassword() == null || userDTO.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        if (userDTO.getRole() == null || userDTO.getRole().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be null or empty");
        }

        try {
            User user = new User();
            user.setName(userDTO.getName());
            user.setEmail(userDTO.getEmail());
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            user.setRole(User.Role.valueOf(userDTO.getRole().toUpperCase()));
            if (userDTO.getRole().equalsIgnoreCase("SHELTER") || userDTO.getRole().equalsIgnoreCase("ADMIN")) {
                user.setAddress(userDTO.getAddress());
                user.setCity(userDTO.getCity());
                user.setState(userDTO.getState());
                user.setZipCode(userDTO.getZipCode());
                user.setContactEmail(userDTO.getContactEmail());
                user.setContactNumber(userDTO.getContactNumber());
            }

            User savedUser = userRepository.save(user);

            UserDTO savedUserDTO = new UserDTO();
            savedUserDTO.setId(savedUser.getId());
            savedUserDTO.setName(savedUser.getName());
            savedUserDTO.setEmail(savedUser.getEmail());
            savedUserDTO.setRole(savedUser.getRole().name());
            savedUserDTO.setAddress(savedUser.getAddress());
            savedUserDTO.setCity(savedUser.getCity());
            savedUserDTO.setState(savedUser.getState());
            savedUserDTO.setZipCode(savedUser.getZipCode());
            savedUserDTO.setContactEmail(savedUser.getContactEmail());
            savedUserDTO.setContactNumber(savedUser.getContactNumber());
            return savedUserDTO;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + userDTO.getRole(), e);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        System.out.println("=== LOAD USER DEBUG ===");
        System.out.println("User email: " + user.getEmail());
        System.out.println("User role: " + user.getRole().name());
        System.out.println("User role string: " + user.getRole().toString());

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();
    }

    public UserDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setRole(user.getRole().name());
        userDTO.setAddress(user.getAddress());
        userDTO.setCity(user.getCity());
        userDTO.setState(user.getState());
        userDTO.setZipCode(user.getZipCode());
        userDTO.setContactEmail(user.getContactEmail());
        userDTO.setContactNumber(user.getContactNumber());
        return userDTO;
    }

    public UserDTO updateUserProfile(String email, UpdateProfileRequest updateRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setName(updateRequest.getName());
        if (user.getRole().equals(User.Role.SHELTER) || user.getRole().equals(User.Role.ADMIN)) {
            user.setAddress(updateRequest.getAddress());
            user.setCity(updateRequest.getCity());
            user.setState(updateRequest.getState());
            user.setZipCode(updateRequest.getZipCode());
            user.setContactEmail(updateRequest.getContactEmail());
            user.setContactNumber(updateRequest.getContactNumber());
        }

        User updatedUser = userRepository.save(user);

        UserDTO updatedUserDTO = new UserDTO();
        updatedUserDTO.setId(updatedUser.getId());
        updatedUserDTO.setName(updatedUser.getName());
        updatedUserDTO.setEmail(updatedUser.getEmail());
        updatedUserDTO.setRole(updatedUser.getRole().name());
        updatedUserDTO.setAddress(updatedUser.getAddress());
        updatedUserDTO.setCity(updatedUser.getCity());
        updatedUserDTO.setState(updatedUser.getState());
        updatedUserDTO.setZipCode(updatedUser.getZipCode());
        updatedUserDTO.setContactEmail(updatedUser.getContactEmail());
        updatedUserDTO.setContactNumber(updatedUser.getContactNumber());
        return updatedUserDTO;
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<User> getShelters() {
        return userRepository.findByRoleIn(List.of(User.Role.SHELTER, User.Role.ADMIN));
    }
}
