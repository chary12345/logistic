package com.logic.logistic.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "booking")
public class Booking {

	@Id
	@Column(name = "loading_reciept", nullable = false, length = 50)
	private String loadingReciept;

	@Column(name = "consignor_name", length = 100)
	private String consignorName;

	@Column(name = "consignor_mobile", length = 15)
	private String consignorMobile;

	@Column(name = "consignor_address", length = 255)
	private String consignorAddress;

	@Column(name = "consignee_name", length = 100)
	private String consigneeName;

	@Column(name = "consignee_mobile", length = 15)
	private String consigneeMobile;

	@Column(name = "consignee_address", length = 255)
	private String consigneeAddress;



	@Column(name = "freight")
	private double freight;

	@Column(name = "sgst")
	private double sgst;

	@Column(name = "cgst")
	private double cgst;

	@Column(name = "igst")
	private double igst;


    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @Column(name = "dispatch_date")
    private LocalDateTime dispatchDate;

    @Column(name = "recieve_date")
    private LocalDateTime recieveDate;

    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;
    
    @Column(name = "consign_status")
    private String  consignStatus;
    
    @Column(name = "bill_type")
    private String billType;
    
    @Column(name = "invoice_number")
    private String invoiceNumber;
    
    @Column(name = "invoice_value")
    private Double  invoiceValue;
    
    @Column(name = "eway_bill_number")
    private String eWayBillNumber;
    
    @Column(name = "branch_code")
    private String BranchCode;
    
    @Column(name = "dest_branch_code")
    private String destinationBranchCode;
    
    @Column(name = "booking_type")
    private String bookingtype;
    
    @Column(name = "employee_name")
    private String employeeName;
    
    @Transient
    private String companyCode;
   
    @Transient
    private int lastNumber;

    
    @Column(name = "modified_date")
    private LocalDateTime modifiedDate;
	

	public String getConsignorName() {
		return consignorName;
	}

	public String getLoadingReciept() {
		return loadingReciept;
	}

	public void setLoadingReciept(String loadingReciept) {
		this.loadingReciept = loadingReciept;
	}

	public void setConsignorName(String consignorName) {
		this.consignorName = consignorName;
	}

	public String getConsignorMobile() {
		return consignorMobile;
	}

	public void setConsignorMobile(String consignorMobile) {
		this.consignorMobile = consignorMobile;
	}

	public String getConsigneeName() {
		return consigneeName;
	}

	public void setConsigneeName(String consigneeName) {
		this.consigneeName = consigneeName;
	}

	public String getConsigneeMobile() {
		return consigneeMobile;
	}

	public void setConsigneeMobile(String consigneeMobile) {
		this.consigneeMobile = consigneeMobile;
	}

	

	public double getFreight() {
		return freight;
	}

	public void setFreight(double freight) {
		this.freight = freight;
	}

	public double getSgst() {
		return sgst;
	}

	public void setSgst(double sgst) {
		this.sgst = sgst;
	}

	public double getCgst() {
		return cgst;
	}

	public void setCgst(double cgst) {
		this.cgst = cgst;
	}

	public double getIgst() {
		return igst;
	}

	public void setIgst(double igst) {
		this.igst = igst;
	}



	public String getConsignorAddress() {
		return consignorAddress;
	}

	public void setConsignorAddress(String consignorAddress) {
		this.consignorAddress = consignorAddress;
	}

	public String getConsigneeAddress() {
		return consigneeAddress;
	}

	public void setConsigneeAddress(String consigneeAddress) {
		this.consigneeAddress = consigneeAddress;
	}

	public LocalDateTime getBookingDate() {
		return bookingDate;
	}

	public void setBookingDate(LocalDateTime bookingDate) {
		this.bookingDate = bookingDate;
	}

	public LocalDateTime getDispatchDate() {
		return dispatchDate;
	}

	public void setDispatchDate(LocalDateTime dispatchDate) {
		this.dispatchDate = dispatchDate;
	}

	public LocalDateTime getRecieveDate() {
		return recieveDate;
	}

	public void setRecieveDate(LocalDateTime recieveDate) {
		this.recieveDate = recieveDate;
	}

	public LocalDateTime getDeliveryDate() {
		return deliveryDate;
	}

	public void setDeliveryDate(LocalDateTime deliveryDate) {
		this.deliveryDate = deliveryDate;
	}

	public String getConsignStatus() {
		return consignStatus;
	}

	public void setConsignStatus(String consignStatus) {
		this.consignStatus = consignStatus;
	}

	public String getCompanyCode() {
		return companyCode;
	}

	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}

	public String getBranchCode() {
		return BranchCode;
	}

	public void setBranchCode(String branchCode) {
		BranchCode = branchCode;
	}

	public int getLastNumber() {
		return lastNumber;
	}

	public void setLastNumber(int lastNumber) {
		this.lastNumber = lastNumber;
	}

	public String getBillType() {
		return billType;
	}

	public void setBillType(String billType) {
		this.billType = billType;
	}

	public String getInvoiceNumber() {
		return invoiceNumber;
	}

	public void setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
	}

	public double getInvoiceValue() {
		return (this.invoiceValue != null) ? this.invoiceValue : 0.0;
	}

	

	public String geteWayBillNumber() {
		return eWayBillNumber;
	}

	public void setInvoiceValue(Double invoiceValue) {
		this.invoiceValue = invoiceValue;
	}

	public void seteWayBillNumber(String eWayBillNumber) {
		this.eWayBillNumber = eWayBillNumber;
	}

	public String getDestinationBranchCode() {
		return destinationBranchCode;
	}

	public void setDestinationBranchCode(String destinationBranchCode) {
		this.destinationBranchCode = destinationBranchCode;
	}

	public String getBookingtype() {
		return bookingtype;
	}

	public void setBookingtype(String bookingtype) {
		this.bookingtype = bookingtype;
	}

	public LocalDateTime getModifiedDate() {
		return modifiedDate;
	}

	public void setModifiedDate(LocalDateTime modifiedDate) {
		this.modifiedDate = modifiedDate;
	}

	public String getEmployeeName() {
		return employeeName;
	}

	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}
	

	

}