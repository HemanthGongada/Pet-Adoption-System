// com.petadoption.dto.AdminDashboardDTO.java
package com.petadoption.dto;

import lombok.Data;

@Data
public class AdminDashboardDTO {
    private Long totalUsers;
    private Long totalPets;
    private Long totalAdoptions;
    private Long pendingAdoptions;

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalPets() {
        return totalPets;
    }

    public void setTotalPets(Long totalPets) {
        this.totalPets = totalPets;
    }

    public Long getTotalAdoptions() {
        return totalAdoptions;
    }

    public void setTotalAdoptions(Long totalAdoptions) {
        this.totalAdoptions = totalAdoptions;
    }

    public Long getPendingAdoptions() {
        return pendingAdoptions;
    }

    public void setPendingAdoptions(Long pendingAdoptions) {
        this.pendingAdoptions = pendingAdoptions;
    }
}