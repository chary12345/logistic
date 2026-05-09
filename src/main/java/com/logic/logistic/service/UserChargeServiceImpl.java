package com.logic.logistic.service;

import com.logic.logistic.dto.UserChargeConfigDTO;
import com.logic.logistic.model.UserChargeConfigModel;
import com.logic.logistic.repository.UserChargeConfigRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class UserChargeServiceImpl implements UserChargeService {

    @Autowired
    private UserChargeConfigRepository repo;

    @Override
    public void save(UserChargeConfigModel dto) {

        // old config remove
        repo.deleteByCompanyCodeAndUserId(dto.getCompanyCode(), dto.getUserId());

        List<UserChargeConfigDTO> list = new ArrayList<>();

        for (UserChargeConfigModel.ChargeItem item : dto.getCharges()) {

            UserChargeConfigDTO config = new UserChargeConfigDTO();
            config.setCompanyCode(dto.getCompanyCode());
            config.setUserId(dto.getUserId());
            config.setChargeName(item.getChargeName());
            config.setDisplayOrder(item.getDisplayOrder());

            list.add(config);
        }

        repo.saveAll(list);
    }

    @Override
    public List<UserChargeConfigDTO> get(String companyCode) {
        return repo.findByCompanyCodeOrderByDisplayOrderAsc(companyCode);
    }
}