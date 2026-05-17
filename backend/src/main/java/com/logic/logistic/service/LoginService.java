package com.logic.logistic.service;

import java.util.Map;

import com.logic.logistic.model.LoginRequest;

public interface LoginService {

	Map<String, Object> userLogin(LoginRequest request);

}
