// src/main/java/com/petadoption/exception/ResourceNotFoundException.java
package com.petadoption.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}