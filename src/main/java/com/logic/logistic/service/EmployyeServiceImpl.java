package com.logic.logistic.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.BranchDTO;
import com.logic.logistic.dto.CompanyDto;
import com.logic.logistic.dto.UserDto;
import com.logic.logistic.mapper.EmployeeMapper;
import com.logic.logistic.model.User;
import com.logic.logistic.repository.BookRepository;
import com.logic.logistic.repository.BranchRepo;
import com.logic.logistic.repository.CompanyRegisterrepo;
import com.logic.logistic.repository.UserRepository;



@Service
public class EmployyeServiceImpl implements EmployeecreationService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private BookRepository bookrepo;

	@Autowired
	private EmailService emailService;

	@Autowired
	private CompanyRegisterrepo companyRegisterrepo;

	@Autowired
	private BranchRepo branchRepo;

	@Override
	public String addNewEmployee(User employee) {
		String status = null;

		UserDto findUser = userRepository.findByUsername(
				employee.getUserName() + employee.getCompanyDetails().getCompanyCode());

		if (findUser == null) {
			List<UserDto> branchUsers = userRepository
					.findBycompanyName(employee.getCompanyDetails().getCompanyBranch().getBranchCode());

			// === Rule 1: Max 3 EMPLOYEE per branch ===
			if (employee.getRole() != null && employee.getRole().equalsIgnoreCase("Employee")) {
				long employeeCount = branchUsers.stream()
						.filter(u -> u.getRole() != null && u.getRole().equalsIgnoreCase("EMPLOYEE"))
						.count();
				if (employeeCount >= 3) {
					return "Maximum 3 Employees allowed in this branch";
				}
			}

			// === Rule 2: Only one Admin per branch ===
			if (employee.getRole() != null && employee.getRole().equalsIgnoreCase("Admin")) {
				boolean adminExists = branchUsers.stream()
						.anyMatch(u -> u.getRole() != null && u.getRole().equalsIgnoreCase("Admin"));
				if (adminExists) {
					return "An Admin already exists in this branch. Cannot create another Admin.";
				}
			}

			try {
				Map<String, Object> convertPojotoDto = EmployeeMapper.newEmployeeToDto(employee);
				for (Map.Entry<String, Object> entry : convertPojotoDto.entrySet()) {
					if (entry.getKey().equals("userDto")) {
						UserDto userDTO = (UserDto) entry.getValue();
						userRepository.save(userDTO);
						System.out.println("new employee created successfully");

						// ── Send welcome email (async, non-blocking) ────────────────────────
						if (employee.getEmail() != null && !employee.getEmail().isBlank()) {

							// FIX 1: Use plain userName (NOT userId = userName+companyCode)
							String displayUsername = employee.getUserName();

							// FIX 2: Fetch branch name from DB using branchCode
							String branchCode = employee.getCompanyDetails().getCompanyBranch().getBranchCode();
							String branchName = null;
							try {
								BranchDTO branchDTO = branchRepo.getBranchBybranchCode(branchCode);
								if (branchDTO != null) {
									branchName = branchDTO.getBranchName();
								}
							} catch (Exception ex) {
								System.err.println("Could not fetch branch name for email: " + ex.getMessage());
							}

							// Resolve company full name from DB
							String companyFullName = null;
							try {
								CompanyDto companyDto = companyRegisterrepo
										.getCompanyByID(employee.getCompanyDetails().getCompanyCode());
								if (companyDto != null) {
									companyFullName = companyDto.getCompanyFullName();
								}
							} catch (Exception ex) {
								System.err.println("Could not fetch company name for email: " + ex.getMessage());
							}

							// CC: admin email passed from Angular session
							String ccEmail = employee.getAdminEmail();

							emailService.sendEmployeeWelcomeEmail(
									employee.getEmail(),
									ccEmail,
									employee.getFirstName() + " " + employee.getLastName(),
									displayUsername,       // FIX 1: plain username only
									employee.getPlainPassword(),
									employee.getCompanyDetails().getCompanyCode(),
									companyFullName,
									branchCode,
									branchName,            // FIX 2: actual branch name from DB
									employee.getRole(),
									employee.getPhone());
						}
						// ──────────────────────────────────────────────────────────────────────
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

	@Override
	public String existsByUserName(String userId) {
		String status = "FAILURE";
		UserDto findByUsername = userRepository.findByUsername(userId);
		if (findByUsername == null) {
			status = "SUCCESS";
		}
		return status;
	}

	@Override
	public List<String> getEmployeesByBranch(String branchCode, String companyCode) {
		return bookrepo.findEmployeeNamesByCompanyAndBranch(companyCode, branchCode);
	}

	@Override
	public List<UserDto> getEmployeesByCompany(String companyCode) {
		return userRepository.findByCompanyCode(companyCode);
	}

	@Override
	public UserDto getEmployeeByUserId(String userId) {
		return userRepository.findById(userId).orElse(null);
	}

	@Override
	@org.springframework.transaction.annotation.Transactional
	public UserDto updateEmployee(String userId, User updatedEmployee) {
		UserDto existing = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("Employee not found"));

		if (updatedEmployee.getFirstName() != null) {
			existing.setFirstName(updatedEmployee.getFirstName());
		}
		if (updatedEmployee.getLastName() != null) {
			existing.setLastName(updatedEmployee.getLastName());
		}
		if (updatedEmployee.getPhone() != null) {
			existing.setPhone(updatedEmployee.getPhone());
		}
		if (updatedEmployee.getEmail() != null) {
			existing.setEmail(updatedEmployee.getEmail());
		}
		if (updatedEmployee.getRole() != null) {
			existing.setRole(updatedEmployee.getRole());
		}
		if (updatedEmployee.getPassword() != null && !updatedEmployee.getPassword().isBlank()) {
			existing.setPassword(updatedEmployee.getPassword());
		}
		if (updatedEmployee.getCompanyDetails() != null && updatedEmployee.getCompanyDetails().getCompanyBranch() != null) {
			String branchCode = updatedEmployee.getCompanyDetails().getCompanyBranch().getBranchCode();
			if (branchCode != null && !branchCode.isBlank()) {
				existing.setBranchCode(branchCode);
			}
		}

		existing.setUpdatedDate(new java.sql.Date(System.currentTimeMillis()));
		return userRepository.save(existing);
	}

	@Override
	@org.springframework.transaction.annotation.Transactional
	public void deleteEmployee(String userId) {
		UserDto existing = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("Employee not found"));
		userRepository.delete(existing);
	}

	@Override
	@org.springframework.transaction.annotation.Transactional
	public Map<String, Object> deleteMultipleEmployees(List<String> userIds) {
		Map<String, Object> result = new java.util.HashMap<>();
		List<String> deleted = new java.util.ArrayList<>();
		List<String> failed = new java.util.ArrayList<>();

		if (userIds == null || userIds.isEmpty()) {
			throw new IllegalArgumentException("No employee IDs provided");
		}

		for (String id : userIds) {
			try {
				deleteEmployee(id);
				deleted.add(id);
			} catch (Exception e) {
				failed.add(id);
			}
		}

		result.put("deleted", deleted);
		result.put("failed", failed);
		result.put("deletedCount", deleted.size());
		result.put("failedCount", failed.size());
		result.put("status", failed.isEmpty() ? "SUCCESS" : (deleted.isEmpty() ? "FAILURE" : "PARTIAL"));
		return result;
	}

}
