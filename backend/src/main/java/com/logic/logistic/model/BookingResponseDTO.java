package com.logic.logistic.model;

import com.logic.logistic.dto.ArticleDetailDto;
import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.BookingChargeDetails;

import java.util.List;

public class BookingResponseDTO {

    private Booking booking;

    private List<ArticleDetailDto> articles;

    private BookingChargeDetails charges;

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public List<ArticleDetailDto> getArticles() {
        return articles;
    }

    public void setArticles(List<ArticleDetailDto> articles) {
        this.articles = articles;
    }

    public BookingChargeDetails getCharges() {
        return charges;
    }

    public void setCharges(BookingChargeDetails charges) {
        this.charges = charges;
    }
}