package com.logic.logistic.repository;

import com.logic.logistic.dto.UserPermissionDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPermissionRepo
        extends JpaRepository<UserPermissionDTO, Long> {


    @Query(value = """
            SELECT *
            FROM user_permissions
            WHERE user_name = :userName
            AND company_code = :companyCode
            """,
            nativeQuery = true)
    UserPermissionDTO getPermissions(
            @Param("userName") String userName,
            @Param("companyCode") String companyCode
    );
}