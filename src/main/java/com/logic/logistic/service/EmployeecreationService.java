package com.logic.logistic.service;

import java.util.List;
import java.util.Map;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.model.User;

public interface EmployeecreationService {

	String addNewEmployee(User employee);

	String existsByUserName(String userName, String companyCode);

	List<String> getEmployeesByBranch(String companyCode, String branchCode);

	List<UserDto> getEmployeesByBranchFull(String companyCode, String branchCode);

	List<UserDto> getEmployeesByCompany(String companyCode);

	UserDto getEmployeeByUserId(String userId);

	UserDto updateEmployee(String userId, User updatedEmployee);

}
