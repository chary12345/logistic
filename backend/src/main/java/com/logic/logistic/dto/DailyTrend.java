package com.logic.logistic.dto;

public class DailyTrend {
    private String date;
    private double value;

    public DailyTrend() {
    }

    public DailyTrend(String date, double value) {
        this.date = date;
        this.value = value;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }
}
