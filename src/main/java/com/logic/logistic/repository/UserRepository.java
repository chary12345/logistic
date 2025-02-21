package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.model.UserModel;

@Repository
public interface UserRepository extends JpaRepository<UserModel, String>{

}
