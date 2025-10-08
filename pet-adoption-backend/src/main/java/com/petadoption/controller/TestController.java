//com.petadoption.controller.TestController.java
package com.petadoption.controller;

import com.petadoption.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/security-context")
    public Map<String, Object> getSecurityContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> result = new HashMap<>();

        result.put("authenticationExists", auth != null);

        if (auth != null) {
            result.put("authenticated", auth.isAuthenticated());
            result.put("name", auth.getName());
            result.put("authorities", auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
            result.put("principalType", auth.getPrincipal().getClass().getName());
            result.put("details", auth.getDetails());
        } else {
            result.put("message", "No authentication found in SecurityContext");
        }

        return result;
    }

    @GetMapping("/check-shelter-role")
    public Map<String, Object> checkShelterRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> result = new HashMap<>();

        if (auth == null || !auth.isAuthenticated()) {
            result.put("hasShelterRole", false);
            result.put("reason", "Not authenticated");
            return result;
        }

        boolean hasShelterRole = auth.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_SHELTER"));

        result.put("hasShelterRole", hasShelterRole);
        result.put("allAuthorities", auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        return result;
    }

    @GetMapping("/headers")
    public Map<String, String> getHeaders(@RequestHeader Map<String, String> headers) {
        return headers.entrySet().stream()
                .filter(entry -> entry.getKey().toLowerCase().contains("auth") ||
                        entry.getKey().toLowerCase().equals("authorization"))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
    @GetMapping("/decode-token")
    public Map<String, Object> decodeToken(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> result = new HashMap<>();

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // Manually decode the token to see what's inside
                String[] chunks = token.split("\\.");
                if (chunks.length == 3) {
                    Base64.Decoder decoder = Base64.getUrlDecoder();

                    String header = new String(decoder.decode(chunks[0]));
                    String payload = new String(decoder.decode(chunks[1]));

                    result.put("header", header);
                    result.put("payload", payload);
                    result.put("tokenLength", token.length());
                }
            } catch (Exception e) {
                result.put("error", "Failed to decode token: " + e.getMessage());
            }
        } else {
            result.put("error", "No valid Bearer token found");
        }

        return result;
    }
    @GetMapping("/load-user")
    public Map<String, Object> loadUser(@RequestParam String email) {
        Map<String, Object> result = new HashMap<>();
        try {
            UserService userDetailsService = null;
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            result.put("success", true);
            result.put("username", userDetails.getUsername());
            result.put("authorities", userDetails.getAuthorities());
            result.put("accountNonExpired", userDetails.isAccountNonExpired());
            result.put("accountNonLocked", userDetails.isAccountNonLocked());
            result.put("credentialsNonExpired", userDetails.isCredentialsNonExpired());
            result.put("enabled", userDetails.isEnabled());
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
    @GetMapping("/test-pet-access")
    public Map<String, Object> testPetAccess() {
        Map<String, Object> result = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        result.put("authenticated", auth != null && auth.isAuthenticated());
        result.put("username", auth != null ? auth.getName() : "null");
        result.put("authorities", auth != null ? auth.getAuthorities().toString() : "null");

        // Check if user has required role for adding pets
        boolean hasShelterRole = auth != null && auth.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_SHELTER"));

        result.put("hasShelterRole", hasShelterRole);
        result.put("canAddPets", hasShelterRole);

        return result;
    }
}