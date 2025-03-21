package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.model.User;

@Repository
public interface UserRepository extends JpaRepository<UserDto, String>{
	
	

	@Query(value = "select * from logistics_logic.user_data where (user_name= :username and password =:password)", nativeQuery = true)
	UserDto findByUsername(String username, String password);

}
