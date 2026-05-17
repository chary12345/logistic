package com.logic.logistic.dto;

import java.util.List;

public class DispatchedResponseDTO {

    private LoadingSheetDTO loadingSheet;
    private List<Booking> bookings;
    private String status;
    public LoadingSheetDTO getLoadingSheet() {
        return loadingSheet;
    }

    public void setLoadingSheet(LoadingSheetDTO loadingSheet) {
        this.loadingSheet = loadingSheet;
    }

    public List<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}