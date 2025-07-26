package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.logic.logistic.dto.UserDto;

@Repository
public interface UserRepository extends JpaRepository<UserDto, String> {
	
    @Query(value = "SELECT * FROM logistics_logic.user_data WHERE user_id = :username", nativeQuery = true)
    UserDto findByUsername(String username);

    // ✅ Added update query for changing password (without removing anything)
    @Modifying
    @Transactional
    @Query(value = "UPDATE logistics_logic.user_data SET password = :newPassword WHERE user_name = :username", nativeQuery = true)
    int updatePassword(@Param("username") String username, @Param("newPassword") String newPassword);
    
    
}
