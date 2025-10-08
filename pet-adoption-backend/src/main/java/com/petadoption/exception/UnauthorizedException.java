// src/main/java/com/petadoption/exception/UnauthorizedException.java
package com.petadoption.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}