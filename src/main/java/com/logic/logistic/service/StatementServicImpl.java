package com.logic.logistic.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.StatementDto;
import com.logic.logistic.repository.BookRepository;

@Service
public class StatementServicImpl implements StatementService{
	
	@Autowired
	private BookRepository bookingRepository;

	@Override
	public List<StatementDto> getStatements(String branchCode, LocalDate from, LocalDate to, String paymentMode) {
	    LocalDateTime fromDateTime = from.atStartOfDay();
	    LocalDateTime toDateTime = to.atTime(23, 59, 59);

	    List<Booking> bookings = bookingRepository.findStatements(
	            branchCode, fromDateTime, toDateTime,
	            (paymentMode == null || paymentMode.isEmpty()) ? null : paymentMode
	    );

	    return bookings.stream().map(b -> {
	        double gst = (b.getSgst() + b.getCgst() + b.getIgst());
	        double total = b.getFreight() + gst + b.getLoading() + b.getLoadingCharge();

	        // Logic: amount effective date
	        LocalDateTime effectiveDate;
	        if ("PAID".equalsIgnoreCase(b.getBillType())) {
	            effectiveDate = b.getBookingDate();
	        } else { // TO PAY / TBB
	            effectiveDate = b.getDispatchDate();
	        }

	        return new StatementDto(
	                b.getLoadingReciept(),
	                b.getBookingDate(),
	                b.getDispatchDate(),
	                b.getConsignorName(),
	                b.getConsigneeName(),
	                b.getBillType(),
	                b.getFreight(),
	                gst,
	                b.getLoading(),
	                b.getLoadingCharge(),
	                (effectiveDate != null ? total : 0) // amount only if effective date present
	        );
	    }).collect(Collectors.toList());
	}

}
