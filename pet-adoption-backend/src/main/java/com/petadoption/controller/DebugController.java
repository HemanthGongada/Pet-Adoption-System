//com.petadoption.controller.DebugController.java
package com.petadoption.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @GetMapping("/roles")
    public String getUserRoles() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().toString();
    }
}
