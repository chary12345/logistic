package com.logic.logistic.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.DailyTrend;
import com.logic.logistic.dto.DashboardSummaryDTO;
import com.logic.logistic.repository.BookRepository;
import com.logic.logistic.repository.VehicleRepository;

@Service
public class DashboardService {

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private VehicleRepository vehicleRepo;

    public DashboardSummaryDTO getSummary(String branchCode) {
        if (branchCode != null) branchCode = branchCode.trim();
        final String finalBranchCode = branchCode;

        LocalDateTime today = LocalDateTime.now();
        LocalDateTime monthStart = today.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime todayStart = today.toLocalDate().atStartOfDay();

        // Fetch all relevant bookings for the month in one go using the new robust query
        List<Booking> allDashboardBookings = bookRepo.findDashboardBookings(monthStart, today, finalBranchCode);

        // Filter based on status and branch role
        List<Booking> myMonthBookings = allDashboardBookings.stream()
            .filter(b -> finalBranchCode.equalsIgnoreCase(b.getBranchCode()))
            .collect(Collectors.toList());

        List<Booking> booked = allDashboardBookings.stream()
            .filter(b -> "BOOKED".equalsIgnoreCase(b.getConsignStatus()) && finalBranchCode.equalsIgnoreCase(b.getBranchCode()))
            .collect(Collectors.toList());

        List<Booking> dispatched = allDashboardBookings.stream()
            .filter(b -> "DISPATCHED".equalsIgnoreCase(b.getConsignStatus()) && finalBranchCode.equalsIgnoreCase(b.getBranchCode()))
            .collect(Collectors.toList());

        List<Booking> received = allDashboardBookings.stream()
            .filter(b -> "RECEIVED".equalsIgnoreCase(b.getConsignStatus()) && finalBranchCode.equalsIgnoreCase(b.getDestinationBranchCode()))
            .collect(Collectors.toList());

        List<Booking> delivered = allDashboardBookings.stream()
            .filter(b -> "DELIVERED".equalsIgnoreCase(b.getConsignStatus()) && finalBranchCode.equalsIgnoreCase(b.getDestinationBranchCode()))
            .collect(Collectors.toList());

        DashboardSummaryDTO summary = new DashboardSummaryDTO();

        summary.setTotalBookings(myMonthBookings.size());
        
        long todayBookCount = myMonthBookings.stream()
            .filter(b -> b.getBookingDate() != null && (b.getBookingDate().isAfter(todayStart) || b.getBookingDate().isEqual(todayStart)))
            .count();
        summary.setTodayBookings(todayBookCount);

        double totalRevenue = myMonthBookings.stream().mapToDouble(this::calculateRevenue).sum();
        summary.setTotalRevenue(totalRevenue);

        double todayRevenue = myMonthBookings.stream()
            .filter(b -> b.getBookingDate() != null && (b.getBookingDate().isAfter(todayStart) || b.getBookingDate().isEqual(todayStart)))
            .mapToDouble(this::calculateRevenue).sum();
        summary.setTodayRevenue(todayRevenue);

        summary.setBookedCount(booked.size());
        summary.setDispatchedCount(dispatched.size());
        summary.setReceivedCount(received.size());
        summary.setDeliveredCount(delivered.size());

        summary.setPaidCount(myMonthBookings.stream().filter(b -> "PAID".equalsIgnoreCase(b.getBillType())).count());
        summary.setToPayCount(myMonthBookings.stream().filter(b -> "TO PAY".equalsIgnoreCase(b.getBillType())).count());
        summary.setTbbCount(myMonthBookings.stream().filter(b -> "TBB".equalsIgnoreCase(b.getBillType())).count());

        int activeVehicles = vehicleRepo.findByBranchCodeAndIsActive(finalBranchCode, true).size();
        summary.setActiveVehicles(activeVehicles);

        // Daily Trends (based on current month's bookings)
        Map<String, Long> dailyBookingCounts = new LinkedHashMap<>();
        Map<String, Double> dailyRevenues = new LinkedHashMap<>();
        
        int currentDay = today.getDayOfMonth();
        
        for (int d = 1; d <= currentDay; d++) {
            LocalDate dt = today.toLocalDate().withDayOfMonth(d);
            String dtStr = String.valueOf(d); 
            
            long dayBookings = myMonthBookings.stream()
                .filter(b -> b.getBookingDate() != null && b.getBookingDate().toLocalDate().isEqual(dt))
                .count();
            dailyBookingCounts.put(dtStr, dayBookings);
            
            double dayRev = myMonthBookings.stream()
                .filter(b -> b.getBookingDate() != null && b.getBookingDate().toLocalDate().isEqual(dt))
                .mapToDouble(this::calculateRevenue).sum();
            dailyRevenues.put(dtStr, dayRev);
        }

        List<DailyTrend> bookingTrend = dailyBookingCounts.entrySet().stream()
            .map(e -> new DailyTrend(e.getKey(), e.getValue()))
            .collect(Collectors.toList());
            
        List<DailyTrend> revenueTrend = dailyRevenues.entrySet().stream()
            .map(e -> new DailyTrend(e.getKey(), e.getValue()))
            .collect(Collectors.toList());

        summary.setBookingTrend(bookingTrend);
        summary.setRevenueTrend(revenueTrend);

        List<Booking> recent = allDashboardBookings.stream()
            .sorted(Comparator.comparing(Booking::getBookingDate, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(10)
            .collect(Collectors.toList());
        summary.setRecentBookings(recent);

        return summary;
    }

    private double calculateRevenue(Booking b) {
        return b.getFreight() + b.getSgst() + b.getCgst() + b.getIgst() + b.getLoading() + b.getLoadingCharge();
    }
}
