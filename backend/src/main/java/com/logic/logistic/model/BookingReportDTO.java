package com.logic.logistic.model;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.BookingChargeDetails;

public class BookingReportDTO {

    private Booking booking;

    private BookingChargeDetails charges;

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public BookingChargeDetails getCharges() {
        return charges;
    }

    public void setCharges(BookingChargeDetails charges) {
        this.charges = charges;
    }
}