package com.logic.logistic.service;

import com.logic.logistic.dto.UserChargeConfigDTO;
import com.logic.logistic.model.UserChargeConfigModel;
import com.logic.logistic.model.UserChargeConfigResponse;
import com.logic.logistic.repository.UserChargeConfigRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserChargeServiceImpl implements UserChargeService {

    @Autowired
    private UserChargeConfigRepository repo;

    @Override
    public void save(UserChargeConfigModel dto) {

        // old config remove
        repo.deleteByCompanyCode(dto.getCompanyCode());

        List<UserChargeConfigDTO> list = new ArrayList<>();

        if (dto.getAvailableCharges() != null) {
            for (UserChargeConfigModel.ChargeItem item : dto.getAvailableCharges()) {
                UserChargeConfigDTO config = new UserChargeConfigDTO();
                config.setCompanyCode(dto.getCompanyCode());
                config.setUserId(dto.getUserId());
                config.setChargeName(item.getChargeName());
                config.setDisplayOrder(item.getDisplayOrder());
                config.setIsSelected(false);
                list.add(config);
            }
        }

        if (dto.getSelectedCharges() != null) {
            for (UserChargeConfigModel.ChargeItem item : dto.getSelectedCharges()) {
                UserChargeConfigDTO config = new UserChargeConfigDTO();
                config.setCompanyCode(dto.getCompanyCode());
                config.setUserId(dto.getUserId());
                config.setChargeName(item.getChargeName());
                config.setDisplayOrder(item.getDisplayOrder());
                config.setIsSelected(true);
                list.add(config);
            }
        }

        repo.saveAll(list);
    }

    @Override
    public UserChargeConfigResponse get(String companyCode) {
        List<UserChargeConfigDTO> allCharges = repo.findByCompanyCodeOrderByDisplayOrderAsc(companyCode);
        
        if (allCharges == null || allCharges.isEmpty()) {
            return getDefaultResponse();
        }
        
        List<UserChargeConfigDTO> available = allCharges.stream()
                .filter(c -> Boolean.FALSE.equals(c.getIsSelected()))
                .collect(Collectors.toList());
                
        List<UserChargeConfigDTO> selected = allCharges.stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsSelected()) || c.getIsSelected() == null) // fallback for old data
                .collect(Collectors.toList());

        String[] defaultCharges = {
            "Crossing Amount", "Crossing Hire", "DCC", "DDC", "Demurrage",
            "Door Delivery", "Door Pickup", "Hamali", "Loading", "Local Vehicle",
            "Miscellaneous", "Other Charges", "Other Transport Charges", "POD Charges",
            "Stationary", "Unloading"
        };

        int maxOrder = allCharges.stream()
                .mapToInt(c -> c.getDisplayOrder() != null ? c.getDisplayOrder() : 0)
                .max().orElse(0);

        for (String defaultCharge : defaultCharges) {
            boolean exists = allCharges.stream().anyMatch(c -> 
                c.getChargeName() != null && c.getChargeName().equalsIgnoreCase(defaultCharge)
            );
            if (!exists) {
                UserChargeConfigDTO dto = new UserChargeConfigDTO();
                dto.setChargeName(defaultCharge);
                dto.setDisplayOrder(++maxOrder);
                dto.setIsSelected(false);
                available.add(dto);
            }
        }

        // Sort available charges alphabetically
        available.sort((a, b) -> {
            if (a.getChargeName() == null) return -1;
            if (b.getChargeName() == null) return 1;
            return a.getChargeName().compareToIgnoreCase(b.getChargeName());
        });

        UserChargeConfigResponse response = new UserChargeConfigResponse();
        response.setAvailableCharges(available);
        response.setSelectedCharges(selected);
        return response;
    }

    private UserChargeConfigResponse getDefaultResponse() {
        UserChargeConfigResponse response = new UserChargeConfigResponse();
        List<UserChargeConfigDTO> available = new ArrayList<>();
        
        String[] defaultCharges = {
            "Crossing Amount", "Crossing Hire", "DCC", "DDC", "Demurrage",
            "Door Delivery", "Door Pickup", "Hamali", "Loading", "Local Vehicle",
            "Miscellaneous", "Other Charges", "Other Transport Charges", "POD Charges",
            "Stationary", "Unloading"
        };
        
        int order = 1;
        for (String chargeName : defaultCharges) {
            UserChargeConfigDTO dto = new UserChargeConfigDTO();
            dto.setChargeName(chargeName);
            dto.setDisplayOrder(order++);
            dto.setIsSelected(false);
            available.add(dto);
        }
        
        // Ensure strictly alphabetical (though they are already in the array above)
        available.sort((a, b) -> {
            if (a.getChargeName() == null) return -1;
            if (b.getChargeName() == null) return 1;
            return a.getChargeName().compareToIgnoreCase(b.getChargeName());
        });

        response.setAvailableCharges(available);
        response.setSelectedCharges(new ArrayList<>());
        return response;
    }
}