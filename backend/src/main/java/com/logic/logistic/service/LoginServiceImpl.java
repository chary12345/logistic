package com.logic.logistic.service;

import java.util.HashMap;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
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

	private static final long serialVersionUID=1L;

	private static org.apache.logging.log4j.Logger logger = LogManager.getLogger();
	
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
			// 1. Verify Company Existence
			com.logic.logistic.dto.CompanyDto company = companyrepo.getCompanyByID(request.getGroup());
			if (company == null) {
				status = "FAILURE";
				map.put("status", status);
				map.put("message", "Given company code is invalid");
				map.put("loginResponse", "");
				return map;
			}

			// 2. Verify User Existence
			UserDto userData = userRepository.findByUserNameAndCompanyCode(request.getUsername(), request.getGroup());

			if (userData == null) {
				status = "FAILURE";
				map.put("status", status);
				map.put("message", "Given username is invalid");
				map.put("loginResponse", "");
				return map;
			}

			// 3. Verify Password
			if (!userData.getPassword().equalsIgnoreCase(request.getPassword())) {
				status = "FAILURE";
				map.put("status", status);
				map.put("message", "Given password is invalid");
				map.put("loginResponse", "");
				return map;
			}

			// 4. Verify Account Status (Activity & Blocking)
			if (!userData.isEmployeeActive()) {
				status = "FAILURE";
				map.put("status", status);
				map.put("message", "This employee account has been deactivated. Please contact your administrator.");
				map.put("loginResponse", "");
				return map;
			}
			
			if (userData.isBlockUser()) {
				status = "FAILURE";
				map.put("status", status);
				String reason = userData.getBlockReason() != null ? ": " + userData.getBlockReason() : "";
				map.put("message", "This account is currently blocked" + reason);
				map.put("loginResponse", "");
				return map;
			}

			// 5. Check Branch and Company Block status
			if (userData.getCompanyCode() != null && userData.getBranchCode() != null) {
				com.logic.logistic.model.CompanyAndBranchProjection projection = companyrepo
						.fetchCompanyAndBranchdetgails(userData.getCompanyCode(), userData.getBranchCode());
				CompanyAndBranch companyAndBranchData = null;
				if (projection != null) {
					companyAndBranchData = new CompanyAndBranch();
					companyAndBranchData.setCompanyCode(projection.getCompanyCode());
					companyAndBranchData.setCompanyName(projection.getCompanyName());
					companyAndBranchData.setGroupName(projection.getGroupName());
					companyAndBranchData.setPlan(projection.getPlan());
					companyAndBranchData.setCompanyLogo(projection.getCompanyLogo());
					companyAndBranchData.setBranchCode(projection.getBranchCode());
					companyAndBranchData.setBranchName(projection.getBranchName());
					companyAndBranchData.setBranchType(projection.getBranchType());
					companyAndBranchData.setCompanyActive(Boolean.TRUE.equals(projection.getIsCompanyActive()));
				}

				if (companyAndBranchData == null) {
					status = "FAILURE";
					map.put("status", status);
					map.put("message", "Critical: Branch mapping for this user was not found.");
					map.put("loginResponse", "");
				} else if (companyAndBranchData.isCompanyActive()) { // Note: true means Blocked in this mapping context
					status = "FAILURE";
					map.put("status", status);
					map.put("message", "Your Company has been blocked. Please contact Master Admin.");
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
				map.put("message", "User profile configuration is incomplete (missing company/branch reference).");
				map.put("loginResponse", "");
			}
			logger.info("Print userData :" +userData);
		} catch (Exception e) {
			status = e.getMessage();
			map.put("status", status);
			map.put("message", status);
			map.put("loginResponse", "");
			logger.error("Exception in userData : "+e);
		}

		System.out.println("Login user status is : " + status);
		logger.info("Login user status is : " + status);

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
		logger.info("loginResponse : "+loginResponse);
		return loginResponse;
	}
}
