package com.logic.logistic.model;

import java.util.List;

public class UserChargeConfigModel {
        private String companyCode;
        private String userId;
        private List<ChargeItem> availableCharges;
        private List<ChargeItem> selectedCharges;

        public static class ChargeItem {
            private String chargeName;
            private Integer displayOrder;

            public String getChargeName() {
                return chargeName;
            }

            public void setChargeName(String chargeName) {
                this.chargeName = chargeName;
            }

            public Integer getDisplayOrder() {
                return displayOrder;
            }

            public void setDisplayOrder(Integer displayOrder) {
                this.displayOrder = displayOrder;
            }
        }

    public String getCompanyCode() {
        return companyCode;
    }

    public void setCompanyCode(String companyCode) {
        this.companyCode = companyCode;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<ChargeItem> getAvailableCharges() {
        return availableCharges;
    }

    public void setAvailableCharges(List<ChargeItem> availableCharges) {
        this.availableCharges = availableCharges;
    }

    public List<ChargeItem> getSelectedCharges() {
        return selectedCharges;
    }

    public void setSelectedCharges(List<ChargeItem> selectedCharges) {
        this.selectedCharges = selectedCharges;
    }
}
