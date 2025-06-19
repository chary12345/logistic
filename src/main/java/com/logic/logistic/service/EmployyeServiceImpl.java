package com.logic.logistic.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.mapper.EmployeeMapper;
import com.logic.logistic.model.User;
import com.logic.logistic.repository.UserRepository;



@Service
public class EmployyeServiceImpl implements EmployeecreationService{

	@Autowired
	private UserRepository userRepository;
	@Override
	public String addNewEmployee(User employee) {
		String status = null;
		
		
			UserDto findUser = userRepository.findByUsername(employee.getUserName()+employee.getCompanyDetails().getCompanyCode());
			if (findUser == null) {

				try {
					Map<String, Object> convertPojotoDto = EmployeeMapper.newEmployeeToDto(employee);
					// Iterate over the map
					for (Map.Entry<String, Object> entry : convertPojotoDto.entrySet()) {

						// Check if the key is "userdto"
						if (entry.getKey().equals("userDto")) {
							// If key is "userdto", cast the object to UserDTO
							UserDto userDTO = (UserDto) entry.getValue();
							// Now you can use userDTO object

							userRepository.save(userDTO);
							System.out.println("new employee created successfully");
						}
					}
					status = "SUCCESS";
				} catch (Exception e) {
					status = e.getMessage();
				}

			} else {
				status = "This user already registered";

			}
			
			return status;
		}
	

}
