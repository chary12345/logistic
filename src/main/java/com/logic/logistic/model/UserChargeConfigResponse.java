package com.logic.logistic.model;

import com.logic.logistic.dto.UserChargeConfigDTO;
import java.util.List;

public class UserChargeConfigResponse {
    private List<UserChargeConfigDTO> availableCharges;
    private List<UserChargeConfigDTO> selectedCharges;

    public List<UserChargeConfigDTO> getAvailableCharges() {
        return availableCharges;
    }

    public void setAvailableCharges(List<UserChargeConfigDTO> availableCharges) {
        this.availableCharges = availableCharges;
    }

    public List<UserChargeConfigDTO> getSelectedCharges() {
        return selectedCharges;
    }

    public void setSelectedCharges(List<UserChargeConfigDTO> selectedCharges) {
        this.selectedCharges = selectedCharges;
    }
}
