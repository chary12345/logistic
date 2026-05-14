package com.logic.logistic.service;

import com.logic.logistic.model.Permissions;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PermissionService {

    public List<String> getPermissionsByRole(String role) {

        List<String> permissions = new ArrayList<>();

        if (role == null) {
            return permissions;
        }

        role = role.toUpperCase();

        switch (role) {
            case "MASTERADMIN":

                permissions.add(Permissions.CREATE_COMPANY);
                permissions.add(Permissions.CREATE_BRANCH);
                permissions.add(Permissions.CREATE_EMPLOYEE);
                permissions.add(Permissions.CREATE_BOOKING);
                permissions.add(Permissions.EDIT_BOOKING);
                permissions.add(Permissions.DELETE_BOOKING);
                permissions.add(Permissions.CREATE_DISPATCH);
                permissions.add(Permissions.CREATE_DELIVERY);
                permissions.add(Permissions.VIEW_REPORTS);
                permissions.add(Permissions.MANAGE_USERS);

                break;

            case "SUPERADMIN":

                permissions.add(Permissions.CREATE_COMPANY);
                permissions.add(Permissions.CREATE_BRANCH);
                permissions.add(Permissions.CREATE_EMPLOYEE);
                permissions.add(Permissions.CREATE_BOOKING);
                permissions.add(Permissions.EDIT_BOOKING);
                permissions.add(Permissions.DELETE_BOOKING);
                permissions.add(Permissions.CREATE_DISPATCH);
                permissions.add(Permissions.CREATE_DELIVERY);
                permissions.add(Permissions.VIEW_REPORTS);
                permissions.add(Permissions.MANAGE_USERS);

                break;

            case "ADMIN":

                permissions.add(Permissions.CREATE_EMPLOYEE);
                permissions.add(Permissions.CREATE_BOOKING);
                permissions.add(Permissions.EDIT_BOOKING);
                permissions.add(Permissions.CREATE_DISPATCH);
                permissions.add(Permissions.CREATE_DELIVERY);
                permissions.add(Permissions.VIEW_REPORTS);

                break;

            case "EMPLOYEE":

                permissions.add(Permissions.CREATE_BOOKING);
                permissions.add(Permissions.CREATE_DISPATCH);
                permissions.add(Permissions.CREATE_DELIVERY);

                break;
        }

        return permissions;
    }

    public boolean hasPermission(String role, String permission) {

        return getPermissionsByRole(role)
                .contains(permission);
    }
}