package com.logic.logistic.dto;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "party_master",
        uniqueConstraints = @UniqueConstraint(columnNames = {"companyCode", "partyName"}))
public class PartyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyCode;
    private String branchCode;

    private String partyName;
    private String displayName;
    private String partyCode;

    private String partyType; // BOOKING / DELIVERY / BOTH

    @Column(name = "is_tbb")
    private Boolean tbb;

    private String contactPerson;

    private String mobileNumber1;
    private String mobileNumber2;

    private String phoneNumber1;
    private String phoneNumber2;

    private String address;
    private String city;
    private String state;
    private String country;
    private String pincode;

    private String gstNumber;
    private String panNumber;
    @Column(name = "is_black_listed")
    private Boolean BlackListed;
    @Column (name= "is_pod_required")
    private Boolean PodRequired;
    private Boolean gstPaidByTransporter;

    private LocalDate issueDate;

    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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


    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getTbb() {
        return tbb;
    }

    public void setTbb(Boolean tbb) {
        this.tbb = tbb;
    }

    public Boolean getBlackListed() {
        return BlackListed;
    }

    public void setBlackListed(Boolean blackListed) {
        BlackListed = blackListed;
    }

    public Boolean getPodRequired() {
        return PodRequired;
    }

    public void setPodRequired(Boolean podRequired) {
        PodRequired = podRequired;
    }

    public Boolean getGstPaidByTransporter() {
        return gstPaidByTransporter;
    }

    public void setGstPaidByTransporter(Boolean gstPaidByTransporter) {
        this.gstPaidByTransporter = gstPaidByTransporter;
    }
}