package com.logic.logistic.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="tbb_invoice")
public class TbbInvoiceDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;

    @Column(name = "consignor_name")
    private String consignorName;

    @Column(name = "from_branch")
    private String fromBranch;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "lr_ids", columnDefinition = "TEXT")
    private String lrIdsJson; // JSON array of LR IDs

    // Stores original consignStatus per LR before billing, so cancel can restore exact status
    // Format: {"PISENA/136":"RECEIVED","PISENA/137":"BOOKED"}
    @Column(name = "previous_lr_statuses", columnDefinition = "TEXT")
    private String previousLrStatusesJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "status")
    private String status; // 'BILLED', 'SETTLED', 'CANCELLED'

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getConsignorName() {
        return consignorName;
    }

    public void setConsignorName(String consignorName) {
        this.consignorName = consignorName;
    }

    public String getFromBranch() {
        return fromBranch;
    }

    public void setFromBranch(String fromBranch) {
        this.fromBranch = fromBranch;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPreviousLrStatusesJson() { return previousLrStatusesJson; }
    public void setPreviousLrStatusesJson(String v) { this.previousLrStatusesJson = v; }

    public String getLrIdsJson() { return lrIdsJson; }

    public void setLrIdsJson(String lrIdsJson) {
        this.lrIdsJson = lrIdsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
