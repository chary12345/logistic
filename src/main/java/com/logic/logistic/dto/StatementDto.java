package com.logic.logistic.dto;

import java.time.LocalDateTime;

public class StatementDto {
    private String loadingReciept;
    private LocalDateTime bookingDate;
    private LocalDateTime dispatchDate;
    private String consignorName;
    private String consigneeName;
    private String billType;   

    private double freight;
    private double gst;
    private double loading;
    private double loadingCharge;
    private double total;
	public String getLoadingReciept() {
		return loadingReciept;
	}
	public void setLoadingReciept(String loadingReciept) {
		this.loadingReciept = loadingReciept;
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
	public String getConsignorName() {
		return consignorName;
	}
	public void setConsignorName(String consignorName) {
		this.consignorName = consignorName;
	}
	public String getConsigneeName() {
		return consigneeName;
	}
	public void setConsigneeName(String consigneeName) {
		this.consigneeName = consigneeName;
	}
	public String getBillType() {
		return billType;
	}
	public void setBillType(String billType) {
		this.billType = billType;
	}
	public double getFreight() {
		return freight;
	}
	public void setFreight(double freight) {
		this.freight = freight;
	}
	public double getGst() {
		return gst;
	}
	public void setGst(double gst) {
		this.gst = gst;
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
	public double getTotal() {
		return total;
	}
	public void setTotal(double total) {
		this.total = total;
	}
	public StatementDto(String loadingReciept, LocalDateTime bookingDate, LocalDateTime dispatchDate,
			String consignorName, String consigneeName, String billType, double freight, double gst, double loading,
			double loadingCharge, double total) {
		super();
		this.loadingReciept = loadingReciept;
		this.bookingDate = bookingDate;
		this.dispatchDate = dispatchDate;
		this.consignorName = consignorName;
		this.consigneeName = consigneeName;
		this.billType = billType;
		this.freight = freight;
		this.gst = gst;
		this.loading = loading;
		this.loadingCharge = loadingCharge;
		this.total = total;
	}
	public StatementDto() {
		super();
	}
    
    
}
