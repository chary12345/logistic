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
import com.logic.logistic.repository.BookRepository;

@Service
public class StatementServicImpl implements StatementService{
	
	@Autowired
	private BookRepository bookingRepository;

	@Override
	public List<StatementDto> getStatements(String branchCode, LocalDateTime from, LocalDateTime to, String paymentMode) {


	    List<Booking> bookings = bookingRepository.findStatements(
	            branchCode, from, to,
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
