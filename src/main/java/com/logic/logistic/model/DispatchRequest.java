package com.logic.logistic.model;

import java.util.List;

public class DispatchRequest {

	private String vehicleNumber;
	private String vehicleName;
	private String destinationBranch;
	private String driverName;
	private String driverPhone;
	private List<String> lrIds;
	public String getVehicleNumber() {
		return vehicleNumber;
	}
	public void setVehicleNumber(String vehicleNumber) {
		this.vehicleNumber = vehicleNumber;
	}
	
	
	public String getVehicleName() {
		return vehicleName;
	}
	public void setVehicleName(String vehicleName) {
		this.vehicleName = vehicleName;
	}
	public String getDestinationBranch() {
		return destinationBranch;
	}
	public void setDestinationBranch(String destinationBranch) {
		this.destinationBranch = destinationBranch;
	}
	public String getDriverName() {
		return driverName;
	}
	public void setDriverName(String driverName) {
		this.driverName = driverName;
	}
	public String getDriverPhone() {
		return driverPhone;
	}
	public void setDriverPhone(String driverPhone) {
		this.driverPhone = driverPhone;
	}
	public List<String> getLrIds() {
		return lrIds;
	}
	public void setLrIds(List<String> lrIds) {
		this.lrIds = lrIds;
	}
	
	
}
