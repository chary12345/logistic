package com.logic.logistic.service;

import java.util.Map;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.dto.UserPermissionDTO;
import com.logic.logistic.model.LoginRequest;

public interface LoginService {

	Map<String, Object> userLogin(LoginRequest request);

	UserPermissionDTO saveOrUpdatePermissions(UserPermissionDTO dto);


}
