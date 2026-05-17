package com.logic.logistic.dto;

import java.util.List;

public class DashboardSummaryDTO {
    private long totalBookings;
    private long todayBookings;
    private double totalRevenue;
    private double todayRevenue;
    private long dispatchedCount;
    private long receivedCount;
    private long deliveredCount;
    private long bookedCount;
    private long paidCount;
    private long toPayCount;
    private long tbbCount;
    private long activeVehicles;
    private List<DailyTrend> bookingTrend;
    private List<DailyTrend> revenueTrend;
    private List<Booking> recentBookings;

    // Getters and Setters
    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getTodayBookings() {
        return todayBookings;
    }

    public void setTodayBookings(long todayBookings) {
        this.todayBookings = todayBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(double todayRevenue) {
        this.todayRevenue = todayRevenue;
    }

    public long getDispatchedCount() {
        return dispatchedCount;
    }

    public void setDispatchedCount(long dispatchedCount) {
        this.dispatchedCount = dispatchedCount;
    }

    public long getReceivedCount() {
        return receivedCount;
    }

    public void setReceivedCount(long receivedCount) {
        this.receivedCount = receivedCount;
    }

    public long getDeliveredCount() {
        return deliveredCount;
    }

    public void setDeliveredCount(long deliveredCount) {
        this.deliveredCount = deliveredCount;
    }

    public long getPaidCount() {
        return paidCount;
    }

    public void setPaidCount(long paidCount) {
        this.paidCount = paidCount;
    }

    public long getBookedCount() {
        return bookedCount;
    }

    public void setBookedCount(long bookedCount) {
        this.bookedCount = bookedCount;
    }

    public long getToPayCount() {
        return toPayCount;
    }

    public void setToPayCount(long toPayCount) {
        this.toPayCount = toPayCount;
    }

    public long getTbbCount() {
        return tbbCount;
    }

    public void setTbbCount(long tbbCount) {
        this.tbbCount = tbbCount;
    }

    public long getActiveVehicles() {
        return activeVehicles;
    }

    public void setActiveVehicles(long activeVehicles) {
        this.activeVehicles = activeVehicles;
    }

    public List<DailyTrend> getBookingTrend() {
        return bookingTrend;
    }

    public void setBookingTrend(List<DailyTrend> bookingTrend) {
        this.bookingTrend = bookingTrend;
    }

    public List<DailyTrend> getRevenueTrend() {
        return revenueTrend;
    }

    public void setRevenueTrend(List<DailyTrend> revenueTrend) {
        this.revenueTrend = revenueTrend;
    }

    public List<Booking> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<Booking> recentBookings) {
        this.recentBookings = recentBookings;
    }
}
