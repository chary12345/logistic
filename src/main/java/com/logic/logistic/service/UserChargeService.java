package com.logic.logistic.service;

import com.logic.logistic.dto.UserChargeConfigDTO;
import com.logic.logistic.model.UserChargeConfigModel;
import com.logic.logistic.model.UserChargeConfigResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserChargeService {
    void save(UserChargeConfigModel dto);
    UserChargeConfigResponse get(String companyCode);
}