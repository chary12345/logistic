package com.logic.logistic.dto;

import jakarta.persistence.*;

@Entity
@Table(name = "user_permissions")
public class UserPermissionDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userName;

    private String companyCode;

    private String role;

    // HOME
    private Boolean home = false;

    // OPERATIONS
    private Boolean booking = false;

    private Boolean dispatch = false;

    @Column(name = "receive_op")
    private Boolean receive = false;

    private Boolean delivery = false;

    // REPORTS
    private Boolean bookingReport = false;

    private Boolean dispatchReport = false;

    private Boolean receiveReport = false;

    private Boolean deliveryReport = false;

    // STATEMENTS
    private Boolean viewStatements = false;

    private Boolean tbbInvoice = false;

    // ADMINISTRATION
    private Boolean branches = false;

    private Boolean employees = false;

    private Boolean vehicles = false;

    private Boolean parties = false;


    private Boolean charges = false;
    private Boolean rolesAndPermissions = false;
    @Transient
    private Boolean globalSearch = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getCompanyCode() {
        return companyCode;
    }

    public void setCompanyCode(String companyCode) {
        this.companyCode = companyCode;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getHome() {
        return home;
    }

    public void setHome(Boolean home) {
        this.home = home;
    }

    public Boolean getBooking() {
        return booking;
    }

    public void setBooking(Boolean booking) {
        this.booking = booking;
    }

    public Boolean getDispatch() {
        return dispatch;
    }

    public void setDispatch(Boolean dispatch) {
        this.dispatch = dispatch;
    }

    public Boolean getReceive() {
        return receive;
    }

    public void setReceive(Boolean receive) {
        this.receive = receive;
    }

    public Boolean getDelivery() {
        return delivery;
    }

    public void setDelivery(Boolean delivery) {
        this.delivery = delivery;
    }

    public Boolean getBookingReport() {
        return bookingReport;
    }

    public void setBookingReport(Boolean bookingReport) {
        this.bookingReport = bookingReport;
    }

    public Boolean getDispatchReport() {
        return dispatchReport;
    }

    public void setDispatchReport(Boolean dispatchReport) {
        this.dispatchReport = dispatchReport;
    }

    public Boolean getReceiveReport() {
        return receiveReport;
    }

    public void setReceiveReport(Boolean receiveReport) {
        this.receiveReport = receiveReport;
    }

    public Boolean getDeliveryReport() {
        return deliveryReport;
    }

    public void setDeliveryReport(Boolean deliveryReport) {
        this.deliveryReport = deliveryReport;
    }

    public Boolean getViewStatements() {
        return viewStatements;
    }

    public void setViewStatements(Boolean viewStatements) {
        this.viewStatements = viewStatements;
    }

    public Boolean getTbbInvoice() {
        return tbbInvoice;
    }

    public void setTbbInvoice(Boolean tbbInvoice) {
        this.tbbInvoice = tbbInvoice;
    }

    public Boolean getBranches() {
        return branches;
    }

    public void setBranches(Boolean branches) {
        this.branches = branches;
    }

    public Boolean getEmployees() {
        return employees;
    }

    public void setEmployees(Boolean employees) {
        this.employees = employees;
    }

    public Boolean getVehicles() {
        return vehicles;
    }

    public void setVehicles(Boolean vehicles) {
        this.vehicles = vehicles;
    }

    public Boolean getParties() {
        return parties;
    }

    public void setParties(Boolean parties) {
        this.parties = parties;
    }

    public Boolean getCharges() {
        return charges;
    }

    public void setCharges(Boolean charges) {
        this.charges = charges;
    }

    public Boolean getRolesAndPermissions() {
        return rolesAndPermissions;
    }

    public void setRolesAndPermissions(Boolean rolesAndPermissions) {
        this.rolesAndPermissions = rolesAndPermissions;
    }

    public Boolean getGlobalSearch() {
        return globalSearch;
    }

    public void setGlobalSearch(Boolean globalSearch) {
        this.globalSearch = globalSearch;
    }
}