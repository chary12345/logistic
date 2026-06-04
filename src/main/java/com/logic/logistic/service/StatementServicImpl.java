package com.logic.logistic.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.logic.logistic.model.LrStatementDTO;
import com.logic.logistic.model.TbbStatementResponse;
import com.logic.logistic.model.TbbSummaryRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.StatementDto;
import com.logic.logistic.dto.BookingChargeDetails;
import com.logic.logistic.repository.BookRepository;
import com.logic.logistic.repository.BookingChargeDetailsRepo;

@Service
public class StatementServicImpl implements StatementService{
	
	@Autowired
	private BookRepository bookingRepository;

	@Autowired
	private BookingChargeDetailsRepo bookingChargeRepo;

	@Override
	public List<StatementDto> getStatements(String branchCode, LocalDateTime from, LocalDateTime to, String paymentMode) {


	    List<Booking> bookings = bookingRepository.findStatements(
	            branchCode, from, to,
	            (paymentMode == null || paymentMode.isEmpty()) ? null : paymentMode
	    );

	    if (bookings == null || bookings.isEmpty()) return new ArrayList<>();

	    List<String> lrIds = bookings.stream().map(Booking::getLoadingReciept).collect(Collectors.toList());
	    List<BookingChargeDetails> charges = bookingChargeRepo.findByLoadingRecieptIn(lrIds);
	    java.util.Map<String, BookingChargeDetails> chargeMap = new java.util.HashMap<>();
	    for (BookingChargeDetails c : charges) {
	        chargeMap.put(c.getLoadingReciept(), c);
	    }

	    return bookings.stream().map(b -> {
	        double gst = (b.getSgst() + b.getCgst() + b.getIgst());
	        
	        double otherCharges = 0;
	        BookingChargeDetails c = chargeMap.get(b.getLoadingReciept());
	        if (c != null) {
	            otherCharges += c.getLrCharge();
	            otherCharges += c.getHamali();
	            otherCharges += c.getStationary();
	            otherCharges += c.getOtherCharges();
	            otherCharges += c.getOtherTransportCharges();
	            otherCharges += c.getMiscellaneous();
	            otherCharges += c.getCrossingAmount();
	            otherCharges += c.getPodCharges();
	            otherCharges += c.getDoorDelivery();
	            otherCharges += c.getDoorPickup();
	            otherCharges += c.getDdc();
	            otherCharges += c.getDcc();
	            otherCharges += c.getDemurrage();
	            otherCharges += c.getUnloading();
	            otherCharges += c.getLocalVehicle();
	            otherCharges += c.getCrossingHire();
	        }
	        
	        double total = b.getFreight() + gst + b.getLoading() + b.getLoadingCharge() + otherCharges;

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
	                otherCharges,
	                (effectiveDate != null ? total : 0) // amount only if effective date present
	        );
	    }).collect(Collectors.toList());
	}

	@Override
	public TbbStatementResponse getTbbStatement(TbbSummaryRequest request) {

		List<Booking> bookings = bookingRepository.findTbbBookings(
				request.getConsignorName(),
				request.getFromDate(),
				request.getToDate()
		);

		double totalFreight = 0;
		double totalGst = 0;

		List<LrStatementDTO> lrList = new ArrayList<>();

		for (Booking b : bookings) {

			double gst = b.getSgst() + b.getCgst() + b.getIgst();
			double total = b.getFreight() + gst;

			totalFreight += b.getFreight();
			totalGst += gst;

			LrStatementDTO lr = new LrStatementDTO();
			lr.setLrNumber(b.getLoadingReciept());
			lr.setBookingDate(b.getBookingDate());
			lr.setFromBranch(b.getBranchCode());
			lr.setToBranch(b.getDestinationBranchCode());
			lr.setConsigneeName(b.getConsigneeName());
			lr.setFreight(b.getFreight());
			lr.setGst(gst);
			lr.setTotal(total);
			lr.setStatus(b.getConsignStatus());

			lrList.add(lr);
		}

		TbbStatementResponse res = new TbbStatementResponse();
		res.setConsignorName(request.getConsignorName());
		res.setTotalLrs(bookings.size());
		res.setTotalFreight(totalFreight);
		res.setTotalGst(totalGst);
		res.setTotalAmount(totalFreight + totalGst);
		res.setLrStatements(lrList);

		return res;
	}

}
