package com.logic.logistic.service;

import com.logic.logistic.model.User;

public interface EmployeecreationService {

	String addNewEmployee(User employee);

	String existsByUserName(String string);

}
