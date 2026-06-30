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

	@Column(name = "consignor_gst", length = 20)
	private String consignorGST;

	@Column(name = "consignee_name", length = 100)
	private String consigneeName;

	@Column(name = "consignee_mobile", length = 15)
	private String consigneeMobile;

	@Column(name = "consignee_address", length = 255)
	private String consigneeAddress;

	@Column(name = "consignee_gst", length = 20)
	private String consigneeGST;



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

    @Column(name = "eway_bill_numbers", length = 1000)
    private String eWayBillNumbers;

    @Column(name = "remarks", length = 1000)
    private String remarks;
    
    @Column(name = "branch_code")
    private String BranchCode;
    
    @Column(name = "dest_branch_code")
    private String destinationBranchCode;

    @Column(name = "cancel_lr")
    private Boolean cancelLr;
    
    @Column(name = "booking_type")
    private String bookingtype;
    
    @Column(name = "employee_name")
    private String employeeName;
    
    @Column(name = "loading")
    private double loading;
    
    @Column(name = "loading_charge")
    private double loadingCharge;
    
    @Column(name = "Paid_via")
    private String paidVia;

	@Column(name = "party_name")
	private String partyName;

    @Column(name = "gst_paid_by")
    private String gstPaidBy;

    @Column(name = "delivery_type")
    private String deliveryType;

    @Transient
    private String companyCode;
   
    @Transient
    private int lastNumber;
    
    @Transient
    private String nextLr;

    @Transient private double lrCharge;
    @Transient private double hamali;
    @Transient private double stationary;
    @Transient private double otherCharges;
    @Transient private double otherTransportCharges;
    @Transient private double miscellaneous;
    @Transient private double crossingAmount;
    @Transient private double podCharges;
    @Transient private double doorDelivery;
    @Transient private double doorPickup;
    @Transient private double ddc;
    @Transient private double dcc;
    @Transient private double demurrage;
    @Transient private double unloading;
    @Transient private double localVehicle;
    @Transient private double crossingHire;
    @Transient private double totalAmount;
    @Transient private double grandTotal;

    
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

	public String getConsignorGST() {
		return consignorGST;
	}

	public void setConsignorGST(String consignorGST) {
		this.consignorGST = consignorGST;
	}

	public String getConsigneeAddress() {
		return consigneeAddress;
	}

	public void setConsigneeAddress(String consigneeAddress) {
		this.consigneeAddress = consigneeAddress;
	}

	public String getConsigneeGST() {
		return consigneeGST;
	}

	public void setConsigneeGST(String consigneeGST) {
		this.consigneeGST = consigneeGST;
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

	public String geteWayBillNumbers() {
		return eWayBillNumbers;
	}

	public void seteWayBillNumbers(String eWayBillNumbers) {
		this.eWayBillNumbers = eWayBillNumbers;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
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

	public double getLoading() {
		return loading;
	}

	public void setLoading(double loading) {
		this.loading = loading;
	}

	public double getLoadingCharge() {
		return loadingCharge;
	}

	public void setLoadingCharge(double loadingCharge) {
		this.loadingCharge = loadingCharge;
	}

	public String getPaidVia() {
		return paidVia;
	}

	public void setPaidVia(String paidVia) {
		this.paidVia = paidVia;
	}

	public String getNextLr() {
		return nextLr;
	}

	public void setNextLr(String nextLr) {
		this.nextLr = nextLr;
	}

	public String getPartyName() {
		return partyName;
	}

	public void setPartyName(String partyName) {
		this.partyName = partyName;
	}

	public String getGstPaidBy() {
		return gstPaidBy;
	}

	public void setGstPaidBy(String gstPaidBy) {
		this.gstPaidBy = gstPaidBy;
	}

	public String getDeliveryType() {
		return deliveryType;
	}

	public void setDeliveryType(String deliveryType) {
		this.deliveryType = deliveryType;
	}

	public double getLrCharge() { return lrCharge; }
	public void setLrCharge(double lrCharge) { this.lrCharge = lrCharge; }

	public double getHamali() { return hamali; }
	public void setHamali(double hamali) { this.hamali = hamali; }

	public double getStationary() { return stationary; }
	public void setStationary(double stationary) { this.stationary = stationary; }

	public double getOtherCharges() { return otherCharges; }
	public void setOtherCharges(double otherCharges) { this.otherCharges = otherCharges; }

	public double getOtherTransportCharges() { return otherTransportCharges; }
	public void setOtherTransportCharges(double otherTransportCharges) { this.otherTransportCharges = otherTransportCharges; }

	public double getMiscellaneous() { return miscellaneous; }
	public void setMiscellaneous(double miscellaneous) { this.miscellaneous = miscellaneous; }

	public double getCrossingAmount() { return crossingAmount; }
	public void setCrossingAmount(double crossingAmount) { this.crossingAmount = crossingAmount; }

	public double getPodCharges() { return podCharges; }
	public void setPodCharges(double podCharges) { this.podCharges = podCharges; }

	public double getDoorDelivery() { return doorDelivery; }
	public void setDoorDelivery(double doorDelivery) { this.doorDelivery = doorDelivery; }

	public double getDoorPickup() { return doorPickup; }
	public void setDoorPickup(double doorPickup) { this.doorPickup = doorPickup; }

	public double getDdc() { return ddc; }
	public void setDdc(double ddc) { this.ddc = ddc; }

	public double getDcc() { return dcc; }
	public void setDcc(double dcc) { this.dcc = dcc; }

	public double getDemurrage() { return demurrage; }
	public void setDemurrage(double demurrage) { this.demurrage = demurrage; }

	public double getUnloading() { return unloading; }
	public void setUnloading(double unloading) { this.unloading = unloading; }

	public double getLocalVehicle() { return localVehicle; }
	public void setLocalVehicle(double localVehicle) { this.localVehicle = localVehicle; }

	public double getCrossingHire() { return crossingHire; }
	public void setCrossingHire(double crossingHire) { this.crossingHire = crossingHire; }

	public double getTotalAmount() { return totalAmount; }
	public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

	public double getGrandTotal() { return grandTotal; }
	public void setGrandTotal(double grandTotal) { this.grandTotal = grandTotal; }

    public Boolean getCancelLr() {
        return cancelLr;
    }

    public void setCancelLr(Boolean cancelLr) {
        this.cancelLr = cancelLr;
    }
}