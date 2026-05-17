package com.logic.logistic.util;

import com.logic.logistic.dto.UserPermissionDTO;

public class PermissionDefaults {

    public static UserPermissionDTO getDefaultPermissions(String role) {

        UserPermissionDTO p = new UserPermissionDTO();

        if(role == null){
            return p;
        }

        switch (role.toUpperCase()) {

            case "MASTERADMIN":

                // ALL ACCESS

                p.setHome(true);

                p.setBooking(true);
                p.setDispatch(true);
                p.setReceive(true);
                p.setDelivery(true);

                p.setBookingReport(true);
                p.setDispatchReport(true);
                p.setReceiveReport(true);
                p.setDeliveryReport(true);

                p.setViewStatements(true);
                p.setTbbInvoice(true);

                p.setBranches(true);
                p.setEmployees(true);
                p.setVehicles(true);
                p.setParties(true);

                p.setCharges(true);
                p.setRolesAndPermissions(true);
                p.setGlobalSearch(true);

                break;


            case "SUPERADMIN":

                // ALL ACCESS

                p.setHome(true);

                p.setBooking(true);
                p.setDispatch(true);
                p.setReceive(true);
                p.setDelivery(true);

                p.setBookingReport(true);
                p.setDispatchReport(true);
                p.setReceiveReport(true);
                p.setDeliveryReport(true);

                p.setViewStatements(true);
                p.setTbbInvoice(true);

                p.setBranches(true);
                p.setEmployees(true);
                p.setVehicles(true);
                p.setParties(true);

                p.setCharges(true);
                p.setRolesAndPermissions(true);
                p.setGlobalSearch(true);
                break;

            case "ADMIN":

                p.setHome(true);

                p.setBooking(true);
                p.setDispatch(true);
                p.setReceive(true);
                p.setDelivery(true);

                // LIMITED REPORTS
                p.setBookingReport(true);
                break;

            case "EMPLOYEE":

                p.setHome(true);

                p.setBooking(true);
                p.setDispatch(true);
                p.setReceive(true);
                p.setDelivery(true);


                break;
        }

        return p;
    }
}