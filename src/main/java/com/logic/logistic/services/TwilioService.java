package com.logic.logistic.services;


import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.model.UserModel;
import com.logic.logistic.repository.UserRepository;

@Service
public class TwilioService {
	/*
	 * @Value("${twilio.account.sid}") private String accountSid;
	 * 
	 * @Value("${twilio.auth.token}") private String authToken;
	 * 
	 * @Value("${twilio.phone.number}") private String twilioPhoneNumber;
	 */
	
	@Autowired
	private  UserRepository userRepository;
	
	
	public String sendOtp(String phoneNumber) {
		//Twilio.init(accountSid, authToken);
		String otp = String.valueOf(new Random().nextInt(9000) + 1000);
		//userRepository.save(new UserModel(phoneNumber, "CUSTOMER", otp));
		/*
		 * Message.creator(new com.twilio.type.PhoneNumber(phoneNumber), new
		 * com.twilio.type.PhoneNumber(twilioPhoneNumber), "Your OTP is: " +
		 * otp).create();
		 */
		return otp;
	}

	public boolean verifyOtp(String phoneNumber, String otp) {
		return false;
		//Optional<UserModel> user = userRepository.findById(phoneNumber);
		//return user.isPresent() && user.get().getOtp().equals(otp);
	}
}

