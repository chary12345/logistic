package com.logic.logistic.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.model.CompanyAndBranch;
import com.logic.logistic.model.LoginRequest;
import com.logic.logistic.model.LoginResponse;
import com.logic.logistic.repository.CompanyRegisterrepo;
import com.logic.logistic.repository.UserRepository;

@Service
public class LoginServiceImpl implements LoginService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private CompanyRegisterrepo companyrepo;

	@Override
	public Map<String, Object> userLogin(LoginRequest request) {
		Map<String, Object> map = new HashMap<String, Object>();
		String status = null;
		LoginResponse loginResponse = new LoginResponse();
		try {
			UserDto userData = userRepository.findByUsername(request.getUsername());

			if (userData != null) {
				if (!userData.getPassword().equalsIgnoreCase(request.getPassword())) {
					status = "FAILURE";
					map.put("status", status);
					map.put("message", "invalid password");
					map.put("loginResponse", "");
				} else if (!userData.getCompanyCode().equalsIgnoreCase(request.getGroup())) {
					status = "FAILURE";
					map.put("status", status);
					map.put("message", "invalid company name");
					map.put("loginResponse", "");
				} else if (userData.isBlockUser()) {
					status = "FAILURE";
					map.put("status", status);
					map.put("message", "user is inactive");
					map.put("loginResponse", "");
				} else if (userData.getCompanyCode() != null && userData.getBranchCode() != null) {
					CompanyAndBranch companyAndBranchData = companyrepo
							.fetchCompanyAndBranchdetgails(userData.getCompanyCode(), userData.getBranchCode());
					if (companyAndBranchData.isCompanyActive()) {
						status = "FAILURE";
						map.put("status", status);
						map.put("message", "your company hasblocked please contact Master Admin");
						map.put("loginResponse", "");
					} else {
						loginResponse.setCompanyAndBranchDeatils(companyAndBranchData);

						loginResponse = mapDtoToLoginResponse(userData, loginResponse);
						status = "SUCCESS";
						map.put("status", status);
						map.put("loginResponse", loginResponse);
					}
				} else {
					status = "FAILURE";
					map.put("status", status);
					map.put("message", "user companydata is missing");
					map.put("loginResponse", "");
				}
			} else {
				status = "FAILURE";
				map.put("status", status);
				map.put("message", "invalid credentials");
				map.put("loginResponse", "");
			}
		} catch (Exception e) {
			status = e.getMessage();
			map.put("status", status);
			map.put("message", status);
			map.put("loginResponse", "");
		}

		System.out.println("Login user status is : " + status);

		return map;
	}

	private LoginResponse mapDtoToLoginResponse(UserDto userDto, LoginResponse loginResponse) {
		if (userDto != null) {
			// Manually checking for null before assigning
			loginResponse.setFirstName(userDto.getFirstName() != null ? userDto.getFirstName() : null);
			loginResponse.setLastName(userDto.getLastName() != null ? userDto.getLastName() : null);
			loginResponse.setUserName(userDto.getUserName() != null ? userDto.getUserName() : "");
			loginResponse.setPhone(userDto.getPhone() != null ? userDto.getPhone() : null);
			loginResponse.setEmail(userDto.getEmail() != null ? userDto.getEmail() : null);
			loginResponse.setRole(userDto.getRole() != null ? userDto.getRole() : null);
			loginResponse.setCreatedDate(userDto.getCreatedDate() != null ? userDto.getCreatedDate() : null);
			loginResponse.setUpdatedDate(userDto.getUpdatedDate() != null ? userDto.getUpdatedDate() : null);
			loginResponse.setExpiryDate(userDto.getExpiryDate() != null ? userDto.getExpiryDate() : null);
			loginResponse.setLogo(userDto.getLogo() != null ? userDto.getLogo() : null);
			loginResponse.setPermissions(userDto.getPermissions() != null ? userDto.getPermissions() : null);
			loginResponse.setBlockReason(userDto.getBlockReason() != null ? userDto.getBlockReason() : null);
			loginResponse.setBlockUser(userDto.isBlockUser()); // Boolean field, no need to check for null
			loginResponse.setBlockedBy(userDto.getBlockedBy() != null ? userDto.getBlockedBy() : null);
		}
		return loginResponse;
	}
}
