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
                p.setTbbBillReport(true);

                p.setViewStatements(true);
                p.setTbbInvoice(true);

                p.setBranches(true);
                p.setEmployees(true);
                p.setVehicles(true);
                p.setParties(true);

                p.setCharges(true);
                p.setRolesAndPermissions(true);
                p.setGlobalSearch(true);
				p.setLoadingSheetList(true);
                p.setArticles(true);
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
                p.setTbbBillReport(true);

                p.setViewStatements(true);
                p.setTbbInvoice(true);

                p.setBranches(true);
                p.setEmployees(true);
                p.setVehicles(true);
                p.setParties(true);

                p.setCharges(true);
                p.setRolesAndPermissions(true);
                p.setLoadingSheetList(true);
                p.setGlobalSearch(true);
                p.setArticles(true);
                break;

            case "ADMIN":

                p.setHome(true);

                p.setBooking(true);
                p.setDispatch(true);
                p.setReceive(true);
                p.setDelivery(true);

                p.setBookingReport(true);
                p.setDispatchReport(true);
                p.setReceiveReport(true);
                p.setDeliveryReport(true);
                p.setTbbBillReport(true);

                p.setViewStatements(true);
                p.setTbbInvoice(true);


                p.setEmployees(true);
                p.setVehicles(true);
                p.setParties(true);

                p.setLoadingSheetList(true);
                break;

            case "EMPLOYEE":

                p.setHome(true);

                // Operations
                p.setBooking(true);
                p.setDispatch(true);
                p.setReceive(true);
                p.setDelivery(true);

                // Reports
                p.setBookingReport(true);
                p.setDispatchReport(true);
                p.setReceiveReport(true);
                p.setDeliveryReport(true);
                p.setTbbBillReport(true);

                // Finance/Billing
               // p.setViewStatements(true);
               // p.setTbbInvoice(true);
                
                // Other
                p.setLoadingSheetList(true);


                // Administration modules (remains false by default):
                // Branches, Employees, Vehicles, Parties, Charges, RolesAndPermissions

                break;
        }

        return p;
    }
}