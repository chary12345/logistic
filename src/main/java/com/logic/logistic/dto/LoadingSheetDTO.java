package com.logic.logistic.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="loading_sheet")
public class LoadingSheetDTO {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loading_sheet_number")
    private Long loadingSheetNumber;

    @Column(name = "vehicle_number")
    private String vehicleNumber;
    
    @Column(name = "vehicle_name")
    private String vehicleName;

    @Column(name = "destination_branch")
    private String destinationBranch;

    @Column(name = "driver_name")
    private String driverName;

    @Column(name = "driver_mobile")
    private String driverPhone;

    @Column(name = "lr_ids", columnDefinition = "TEXT")
    private String lrIdsJson; // JSON string of LR IDs

    @Column(name = "created_date")
    private LocalDateTime createdAt;

	public Long getLoadingSheetNumber() {
		return loadingSheetNumber;
	}

	public void setLoadingSheetNumber(Long loadingSheetNumber) {
		this.loadingSheetNumber = loadingSheetNumber;
	}

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

	public String getLrIdsJson() {
		return lrIdsJson;
	}

	public void setLrIdsJson(String lrIdsJson) {
		this.lrIdsJson = lrIdsJson;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
    
    
}
