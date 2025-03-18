package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.logic.logistic.model.User;
import com.logic.logistic.model.UserModel;

@Repository
public interface UserRepository extends JpaRepository<UserModel, String>{
	
	@Query(value = "select * from logistics_logic.user where username= :username", nativeQuery = true)
	User findByUsername(String username);

}
