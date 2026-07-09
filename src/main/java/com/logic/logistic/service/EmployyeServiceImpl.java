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

		UserDto findUser = userRepository.findByUserNameAndCompanyCode(
				employee.getUserName(), employee.getCompanyDetails().getCompanyCode());

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
	public String existsByUserName(String userName, String companyCode) {
		String status = "FAILURE";
		UserDto findByUsername = userRepository.findByUserNameAndCompanyCode(userName, companyCode);
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
	public List<UserDto> getEmployeesByBranchFull(String companyCode, String branchCode) {
		List<UserDto> all = userRepository.findByCompanyCode(companyCode);
		return all.stream()
				.filter(u -> branchCode.equalsIgnoreCase(u.getBranchCode()))
				.collect(java.util.stream.Collectors.toList());
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

		java.util.Map<String, String[]> changes = new java.util.LinkedHashMap<>();

		if (updatedEmployee.getFirstName() != null && !java.util.Objects.equals(existing.getFirstName(), updatedEmployee.getFirstName())) {
			changes.put("First Name", new String[]{existing.getFirstName(), updatedEmployee.getFirstName()});
			existing.setFirstName(updatedEmployee.getFirstName());
		}
		if (updatedEmployee.getLastName() != null && !java.util.Objects.equals(existing.getLastName(), updatedEmployee.getLastName())) {
			changes.put("Last Name", new String[]{existing.getLastName(), updatedEmployee.getLastName()});
			existing.setLastName(updatedEmployee.getLastName());
		}
		
		// Update username with uniqueness check
		if (updatedEmployee.getUserName() != null && !updatedEmployee.getUserName().isBlank() && !java.util.Objects.equals(existing.getUserName(), updatedEmployee.getUserName())) {

			UserDto collision = userRepository.findByUserNameAndCompanyCode(updatedEmployee.getUserName(), existing.getCompanyCode());
			if (collision != null) {
				throw new RuntimeException("The username '" + updatedEmployee.getUserName() + "' is already taken by another account in your company.");
			}
			changes.put("Username", new String[]{existing.getUserName(), updatedEmployee.getUserName()});
			existing.setUserName(updatedEmployee.getUserName());
		}
		
		if (updatedEmployee.getPhone() != null && !java.util.Objects.equals(existing.getPhone(), updatedEmployee.getPhone())) {
			changes.put("Phone Number", new String[]{existing.getPhone(), updatedEmployee.getPhone()});
			existing.setPhone(updatedEmployee.getPhone());
		}
		if (updatedEmployee.getEmail() != null && !java.util.Objects.equals(existing.getEmail(), updatedEmployee.getEmail())) {
			changes.put("Email Address", new String[]{existing.getEmail(), updatedEmployee.getEmail()});
			existing.setEmail(updatedEmployee.getEmail());
		}
		if (updatedEmployee.getRole() != null && !java.util.Objects.equals(existing.getRole(), updatedEmployee.getRole())) {
			changes.put("User Role", new String[]{existing.getRole(), updatedEmployee.getRole()});
			existing.setRole(updatedEmployee.getRole());
		}
		if (updatedEmployee.getPassword() != null && !updatedEmployee.getPassword().isBlank()) {
			existing.setPassword(updatedEmployee.getPassword());
			changes.put("Account Password", new String[]{"********", "(Updated to a new secure password)"});
		}
		
		// Status Update detection
		if (existing.isEmployeeActive() != updatedEmployee.isEmployeeActive()) {
			changes.put("Account Status", new String[]{existing.isEmployeeActive() ? "ACTIVE" : "DEACTIVATED", updatedEmployee.isEmployeeActive() ? "ACTIVE" : "DEACTIVATED"});
			existing.setEmployeeActive(updatedEmployee.isEmployeeActive());
		}
		
		if (updatedEmployee.getCompanyDetails() != null && updatedEmployee.getCompanyDetails().getCompanyBranch() != null) {
			String newBranchCode = updatedEmployee.getCompanyDetails().getCompanyBranch().getBranchCode();
			if (newBranchCode != null && !newBranchCode.isBlank() && !java.util.Objects.equals(existing.getBranchCode(), newBranchCode)) {
				
				String oldBranchName = null;
				try {
					BranchDTO b = branchRepo.getBranchBybranchCode(existing.getBranchCode());
					if (b != null) oldBranchName = b.getBranchName();
				} catch (Exception e) {}
				
				String newBranchName = null;
				try {
					BranchDTO b = branchRepo.getBranchBybranchCode(newBranchCode);
					if (b != null) newBranchName = b.getBranchName();
				} catch (Exception e) {}
				
				String oldVal = (oldBranchName != null ? oldBranchName : "") + " (" + existing.getBranchCode() + ")";
				String newVal = (newBranchName != null ? newBranchName : "") + " (" + newBranchCode + ")";
				
				changes.put("Assigned Branch", new String[]{oldVal, newVal});
				existing.setBranchCode(newBranchCode);
			}
		}

		existing.setUpdatedDate(new java.sql.Date(System.currentTimeMillis()));
		UserDto saved = userRepository.save(existing);
		
		// Send profile update email async
		if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
			String branchName = null;
			try {
				BranchDTO branchDTO = branchRepo.getBranchBybranchCode(saved.getBranchCode());
				if (branchDTO != null) branchName = branchDTO.getBranchName();
			} catch (Exception e) {}

			String companyFullName = null;
			try {
				CompanyDto companyDto = companyRegisterrepo.getCompanyByID(saved.getCompanyCode());
				if (companyDto != null) companyFullName = companyDto.getCompanyFullName();
			} catch (Exception e) {}

			emailService.sendEmployeeUpdateEmail(
				saved.getEmail(),
				saved.getFirstName() + " " + saved.getLastName(),
				saved.getUserName(),
				saved.getCompanyCode(),
				companyFullName,
				saved.getBranchCode(),
				branchName,
				saved.getRole(),
				saved.getPhone(),
				saved.isEmployeeActive(),
				changes
			);
		}

		
		return saved;
	}
}
