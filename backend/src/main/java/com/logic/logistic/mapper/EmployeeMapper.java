package com.logic.logistic.mapper;

import java.util.HashMap;
import java.util.Map;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.model.User;



public class EmployeeMapper {

	public static Map<String, Object> newEmployeeToDto(User user) {
		Map<String, Object> dtoMap = new HashMap<String, Object>();
		if (user == null)
			return null; // If the User object is null, return null

		UserDto userDto = new UserDto();
		userDto.setUserName(user.getUserName() != null ? user.getUserName() : null);
		userDto.setFirstName(user.getFirstName() != null ? user.getFirstName() : null);
		userDto.setLastName(user.getLastName() != null ? user.getLastName() : null);
		userDto.setPassword(user.getPassword() != null ? user.getPassword() : null);
		userDto.setPhone(user.getPhone() != null ? user.getPhone() : null);
		userDto.setEmail(user.getEmail() != null ? user.getEmail() : null);
		userDto.setRole(user.getRole() != null ? user.getRole() : null);
		// Mapping dates with checks
		userDto.setCreatedDate(
				user.getCreatedDate() != null ? user.getCreatedDate() : new java.sql.Date(System.currentTimeMillis()));
		userDto.setUpdatedDate(user.getUpdatedDate() != null ? user.getUpdatedDate() : null);
		userDto.setExpiryDate(user.getExpiryDate() != null ? user.getExpiryDate() : null);
		userDto.setLogo(user.getLogo() != null ? user.getLogo() : null);
		userDto.setPermissions(user.getPermissions() != null ? user.getPermissions() : null);
		userDto.setBlockUser(user.isBlockUser());
		userDto.setBlockReason(user.getBlockReason() != null ? user.getBlockReason() : null);
		userDto.setBlockedBy(user.getBlockedBy() != null ? user.getBlockedBy() : null);
		if (user.getCompanyDetails() != null) {
			userDto.setCompanyCode(user.getCompanyDetails().getCompanyCode());
			if (user.getCompanyDetails().getCompanyBranch() != null) {

				userDto.setBranchCode(user.getCompanyDetails().getCompanyBranch().getBranchCode());
			}
			userDto.setUserId(userDto.getUserName() + userDto.getCompanyCode());
		}

		dtoMap.put("userDto", userDto);

		return dtoMap;
	}
}
