//com.petadoption.dto.LoginResponse.java
package com.petadoption.dto;

public class LoginResponse {
    private String token;

    // Constructor for JWT token
    public LoginResponse(String token) {
        this.token = token;
    }

    // Default constructor (optional, but good practice)
    public LoginResponse() {
    }

    // Getters and setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
