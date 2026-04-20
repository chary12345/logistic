package com.logic.logistic.service;

import java.util.List;

import com.logic.logistic.model.User;

public interface EmployeecreationService {

	String addNewEmployee(User employee);

	String existsByUserName(String string);

	List<String> getEmployeesByBranch(String companyCode, String branchCode);

}
