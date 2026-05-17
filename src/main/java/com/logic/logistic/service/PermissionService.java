package com.logic.logistic.service;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.dto.UserPermissionDTO;
import com.logic.logistic.repository.UserPermissionRepo;
import com.logic.logistic.util.PermissionDefaults;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PermissionService {

    @Autowired
    private UserPermissionRepo permissionRepo;

    public Map<String, Boolean> getPermissionsByRole(UserDto userDto) {
        Map<String, Boolean> permissionMap;

        if (userDto.getUserName() != null && userDto.getCompanyCode() != null) {

            UserPermissionDTO permission =
                    permissionRepo.findByUserNameAndCompanyCode(
                            userDto.getUserName(),userDto.getCompanyCode()
                    ).orElse(null);

            if (permission != null) {

                permissionMap = convertPermissionToMap(permission);
               if (userDto.getRole().equalsIgnoreCase("SUPERADMIN")||userDto.getRole().equalsIgnoreCase("MASTERADMIN"))
                   permissionMap.put("globalSearch",true);


            } else {

                UserPermissionDTO defaults =
                        PermissionDefaults.getDefaultPermissions(
                                userDto.getRole()
                        );

                permissionMap = convertPermissionToMap(defaults);
            }

        } else {

            UserPermissionDTO defaults =
                    PermissionDefaults.getDefaultPermissions(
                            userDto.getRole()
                    );

            permissionMap = convertPermissionToMap(defaults);
        }

        return permissionMap;
    }

    @Transactional
    public UserPermissionDTO saveOrUpdatePermissions(UserPermissionDTO dto) {

        try {

            // ================= VALIDATIONS =================

            if (dto == null) {
                throw new RuntimeException("Request body is empty");
            }

            if (dto.getUserName() == null ||
                    dto.getUserName().trim().isEmpty()) {

                throw new RuntimeException("Username is required");
            }

            if (dto.getCompanyCode() == null ||
                    dto.getCompanyCode().trim().isEmpty()) {

                throw new RuntimeException("Company code is required");
            }

            if (dto.getRole() == null ||
                    dto.getRole().trim().isEmpty()) {

                throw new RuntimeException("Role is required");
            }


            // ================= FIND EXISTING =================

            Optional<UserPermissionDTO> existing =

                    permissionRepo
                            .findByUserNameAndCompanyCode(
                                    dto.getUserName(),
                                    dto.getCompanyCode()
                            );

            UserPermissionDTO permission;

            // ================= UPDATE =================

            if (existing.isPresent()) {

                permission = existing.get();


            } else {

                // ================= NEW SAVE =================

                permission = new UserPermissionDTO();

                permission.setUserName(dto.getUserName());

                permission.setCompanyCode(
                        dto.getCompanyCode()
                );

                permission.setRole(dto.getRole());


            }

            // ================= HOME =================

            permission.setHome(dto.getHome());

            // ================= OPERATIONS =================

            permission.setBooking(dto.getBooking());

            permission.setDispatch(dto.getDispatch());

            permission.setReceive(dto.getReceive());

            permission.setDelivery(dto.getDelivery());

            // ================= REPORTS =================

            permission.setBookingReport(
                    dto.getBookingReport()
            );

            permission.setDispatchReport(
                    dto.getDispatchReport()
            );

            permission.setReceiveReport(
                    dto.getReceiveReport()
            );

            permission.setDeliveryReport(
                    dto.getDeliveryReport()
            );

            // ================= STATEMENTS =================

            permission.setViewStatements(
                    dto.getViewStatements()
            );

            permission.setTbbInvoice(
                    dto.getTbbInvoice()
            );

            // ================= ADMIN =================

            permission.setBranches(dto.getBranches());

            permission.setEmployees(dto.getEmployees());

            permission.setVehicles(dto.getVehicles());

            permission.setParties(dto.getParties());

            // ================= EXTRA =================

            permission.setCharges(dto.getCharges());

            permission.setRolesAndPermissions(
                    dto.getRolesAndPermissions()
            );

            // ================= SAVE =================

            permission = permissionRepo.save(permission);


            return permission;

        } catch (Exception e) {


            throw new RuntimeException(
                    "Unable to save permissions : "
                            + e.getMessage()
            );
        }
    }


    private Map<String, Boolean> convertPermissionToMap(
            UserPermissionDTO p
    ) {

        Map<String, Boolean> map = new HashMap<>();

        map.put("home", p.getHome());

        map.put("booking", p.getBooking());
        map.put("dispatch", p.getDispatch());
        map.put("receive", p.getReceive());
        map.put("delivery", p.getDelivery());

        map.put("bookingReport", p.getBookingReport());
        map.put("dispatchReport", p.getDispatchReport());
        map.put("receiveReport", p.getReceiveReport());
        map.put("deliveryReport", p.getDeliveryReport());

        map.put("viewStatements", p.getViewStatements());
        map.put("tbbInvoice", p.getTbbInvoice());

        map.put("branches", p.getBranches());
        map.put("employees", p.getEmployees());
        map.put("vehicles", p.getVehicles());
        map.put("parties", p.getParties());

        map.put("rolesAndPermissions", p.getRolesAndPermissions());
        map.put("globalSearch", p.getGlobalSearch());
        map.put("charges", p.getCharges());

        return map;
    }
}