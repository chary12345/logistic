package com.logic.logistic.service;

import com.logic.logistic.dto.UserChargeConfigDTO;
import com.logic.logistic.model.UserChargeConfigModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserChargeService {
    void save(UserChargeConfigModel dto);
    List<UserChargeConfigDTO> get(String companyCode);
}