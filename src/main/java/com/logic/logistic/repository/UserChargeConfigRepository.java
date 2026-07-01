package com.logic.logistic.repository;

import com.logic.logistic.dto.UserChargeConfigDTO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserChargeConfigRepository extends JpaRepository<UserChargeConfigDTO, Long> {

    List<UserChargeConfigDTO> findByCompanyCodeOrderByDisplayOrderAsc(
            String companyCode);

    void deleteByCompanyCode(String companyCode);
}