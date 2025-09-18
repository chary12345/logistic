package com.logic.logistic.model;

import java.util.List;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.LoadingSheetDTO;

public class DispatchResponse {

    private List<Booking> bookings;
    private LoadingSheetDTO loadingSheet;

    // Getters and Setters
    public List<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }

    public LoadingSheetDTO getLoadingSheet() {
        return loadingSheet;
    }

    public void setLoadingSheet(LoadingSheetDTO loadingSheet) {
        this.loadingSheet = loadingSheet;
    }
}
 