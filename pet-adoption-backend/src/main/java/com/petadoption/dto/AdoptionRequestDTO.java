//com.petadoption.dto.AdoptionRequestDTO.java
package com.petadoption.dto;

import lombok.Data;

@Data
public class AdoptionRequestDTO {
    private Long id;
    private Long userId;
    private Long petId;
    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
