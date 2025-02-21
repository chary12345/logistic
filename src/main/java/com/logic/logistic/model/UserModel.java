package com.logic.logistic.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserModel {
    @Id
    private String phoneNumber; // Primary key
    private String role; // "ADMIN" or "CUSTOMER"
    private String otp; // Stores OTP
	public String getPhoneNumber() {
		return phoneNumber;
	}
	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getOtp() {
		return otp;
	}
	public void setOtp(String otp) {
		this.otp = otp;
	}
	public UserModel(String phoneNumber, String role, String otp) {
		super();
		this.phoneNumber = phoneNumber;
		this.role = role;
		this.otp = otp;
	}
	public UserModel() {
		super();
	}
    
    
}
