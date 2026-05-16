package com.logic.logistic.model;
import jakarta.validation.constraints.Pattern;
import org.apache.logging.log4j.core.config.plugins.validation.constraints.NotBlank;


import java.time.LocalDate;

public class PartyRequestDTO {

    @NotBlank(message = "Company code is required")
    private String companyCode;

    @NotBlank(message = "Branch code is required")
    private String branchCode;

    @NotBlank(message = "Party name is required")
    private String partyName;

    private String displayName;

    private String partyCode;

    @NotBlank(message = "Party type is required")
    private String partyType;

    private Boolean isTbb = false;

    private String contactPerson;

    @Pattern(regexp = "^[0-9]{10}$", message = "Invalid mobile number")
    private String mobileNumber1;

    private String mobileNumber2;

    private String phoneNumber1;
    private String phoneNumber2;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;
    private String country;
    private String pincode;

    private String gstNumber;
    private String panNumber;

    private Boolean isBlackListed = false;
    private Boolean isPodRequired = false;
    private Boolean gstPaidByTransporter = false;

    private LocalDate issueDate;

    public String getCompanyCode() {
        return companyCode;
    }

    public void setCompanyCode(String companyCode) {
        this.companyCode = companyCode;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public String getPartyName() {
        return partyName;
    }

    public void setPartyName(String partyName) {
        this.partyName = partyName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPartyCode() {
        return partyCode;
    }

    public void setPartyCode(String partyCode) {
        this.partyCode = partyCode;
    }

    public String getPartyType() {
        return partyType;
    }

    public void setPartyType(String partyType) {
        this.partyType = partyType;
    }

    public Boolean getTbb() {
        return isTbb;
    }

    public void setTbb(Boolean tbb) {
        isTbb = tbb;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getMobileNumber1() {
        return mobileNumber1;
    }

    public void setMobileNumber1(String mobileNumber1) {
        this.mobileNumber1 = mobileNumber1;
    }

    public String getMobileNumber2() {
        return mobileNumber2;
    }

    public void setMobileNumber2(String mobileNumber2) {
        this.mobileNumber2 = mobileNumber2;
    }

    public String getPhoneNumber1() {
        return phoneNumber1;
    }

    public void setPhoneNumber1(String phoneNumber1) {
        this.phoneNumber1 = phoneNumber1;
    }

    public String getPhoneNumber2() {
        return phoneNumber2;
    }

    public void setPhoneNumber2(String phoneNumber2) {
        this.phoneNumber2 = phoneNumber2;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getGstNumber() {
        return gstNumber;
    }

    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public Boolean getBlackListed() {
        return isBlackListed;
    }

    public void setBlackListed(Boolean blackListed) {
        isBlackListed = blackListed;
    }

    public Boolean getPodRequired() {
        return isPodRequired;
    }

    public void setPodRequired(Boolean podRequired) {
        isPodRequired = podRequired;
    }

    public Boolean getGstPaidByTransporter() {
        return gstPaidByTransporter;
    }

    public void setGstPaidByTransporter(Boolean gstPaidByTransporter) {
        this.gstPaidByTransporter = gstPaidByTransporter;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }
}