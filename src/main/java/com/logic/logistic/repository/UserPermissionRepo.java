package com.logic.logistic.repository;

import com.logic.logistic.dto.UserPermissionDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPermissionRepo
        extends JpaRepository<UserPermissionDTO, Long> {

    Optional<UserPermissionDTO> findByUserNameAndCompanyCode(
            String userName,
            String companyCode
    );
}