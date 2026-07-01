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
import com.logic.logistic.dto.BranchDTO;
import com.logic.logistic.dto.StatementDto;
import com.logic.logistic.dto.BookingChargeDetails;
import com.logic.logistic.repository.BookRepository;
import com.logic.logistic.repository.BookingChargeDetailsRepo;
import com.logic.logistic.repository.BranchRepo;
import com.logic.logistic.repository.TbbInvoiceRepository;
import com.logic.logistic.repository.TbbInvoiceSequenceRepository;
import com.logic.logistic.dto.TbbInvoiceDTO;
import com.logic.logistic.dto.TbbInvoiceSequence;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;


@Service
public class StatementServicImpl implements StatementService{
	
	@Autowired
	private BookRepository bookingRepository;

	@Autowired
	private BookingChargeDetailsRepo bookingChargeRepo;

	@Autowired
	private TbbInvoiceRepository tbbInvoiceRepository;

	@Autowired
	private TbbInvoiceSequenceRepository tbbInvoiceSequenceRepository;

	@Autowired
	private BranchRepo branchRepo;

	/** Local cache: branchCode -> branchName */
	private java.util.Map<String, String> branchNameCache = new java.util.concurrent.ConcurrentHashMap<>();

	private String resolveBranchName(String code) {
		if (code == null || code.isEmpty()) return code;
		return branchNameCache.computeIfAbsent(code, c -> {
			try {
				BranchDTO b = branchRepo.getBranchBybranchCode(c);
				return b != null && b.getBranchName() != null ? b.getBranchName() : c;
			} catch (Exception e) { return c; }
		});
	}

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

		List<Booking> bookings;
		if (request.getFromDate() != null && request.getToDate() != null) {
			bookings = bookingRepository.findTbbBookings(
					request.getConsignorName(),
	                request.getFromBranch(),
					request.getFromDate(),
					request.getToDate()
			);
		} else {
			// No date filter – return all un-billed TBB LRs for this party + branch
			bookings = bookingRepository.findTbbBookingsNoDate(
					request.getConsignorName(),
					request.getFromBranch()
			);
		}

		double totalFreight = 0;
		double totalGst = 0;
		double totalLoading = 0;

		List<LrStatementDTO> lrList = new ArrayList<>();

		for (Booking b : bookings) {

			double gst = b.getSgst() + b.getCgst() + b.getIgst();
			double loadingAmt = b.getLoading() + b.getLoadingCharge();
			double total = b.getFreight() + gst + loadingAmt;

			totalFreight += b.getFreight();
			totalGst    += gst;
			totalLoading += loadingAmt;

			LrStatementDTO lr = new LrStatementDTO();
			lr.setLrNumber(b.getLoadingReciept());
			lr.setBookingDate(b.getBookingDate());
			lr.setFromBranch(b.getBranchCode());
			lr.setFromBranchName(resolveBranchName(b.getBranchCode()));
			lr.setToBranch(b.getDestinationBranchCode());
			lr.setToBranchName(resolveBranchName(b.getDestinationBranchCode()));
			lr.setConsigneeName(b.getConsigneeName());
			lr.setFreight(b.getFreight());
			lr.setLoading(loadingAmt);
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
		res.setTotalAmount(totalFreight + totalGst + totalLoading);
		res.setLrStatements(lrList);

		return res;
	}

    @Override
    public String generateTbbInvoice(List<String> lrIds, String consignorName, String fromBranch, Double totalAmount) {
        String invoiceNumber = generateNextSequence(fromBranch);
        
        TbbInvoiceDTO invoice = new TbbInvoiceDTO();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setConsignorName(consignorName);
        invoice.setFromBranch(fromBranch);
        invoice.setTotalAmount(totalAmount);
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setStatus("BILLED");
        
        try {
            invoice.setLrIdsJson(new ObjectMapper().writeValueAsString(lrIds));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        
        tbbInvoiceRepository.save(invoice);
        
        List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(lrIds);
        for (Booking b : bookings) {
            b.setConsignStatus("BILLED");
        }
        bookingRepository.saveAll(bookings);
        
        return invoiceNumber;
    }
    
    private synchronized String generateNextSequence(String branch) {
        TbbInvoiceSequence seq = tbbInvoiceSequenceRepository.findById(branch).orElse(null);
        if (seq == null) {
            seq = new TbbInvoiceSequence();
            seq.setKeyCode(branch);
            seq.setLastNumber(0);
        }
        
        seq.setLastNumber(seq.getLastNumber() + 1);
        tbbInvoiceSequenceRepository.save(seq);
        
        return branch + "_TBB_Bill_" + seq.getLastNumber();
    }

    @Override
    public List<TbbInvoiceDTO> getTbbInvoices(String fromBranch, LocalDateTime fromDate, LocalDateTime toDate) {
        return tbbInvoiceRepository.findByBranchAndDateRange(fromBranch, fromDate, toDate);
    }

    @Override
    public List<TbbInvoiceDTO> searchTbbInvoices(String branchCode, String invoiceNumber, LocalDateTime fromDate, LocalDateTime toDate) {
        // Search by invoice number only
        if (invoiceNumber != null && !invoiceNumber.isEmpty()) {
            return tbbInvoiceRepository.findByInvoiceNumber(invoiceNumber)
                .map(inv -> java.util.Collections.singletonList(inv))
                .orElse(new ArrayList<>());
        }
        // Search by date range only
        if (fromDate != null && toDate != null) {
            return tbbInvoiceRepository.findByBranchAndDateRange(branchCode, fromDate, toDate);
        }
        // Fallback: return recent bills for branch
        return tbbInvoiceRepository.findByFromBranchOrderByCreatedAtDesc(branchCode);
    }

    @Override
    public List<com.logic.logistic.model.LrStatementDTO> getTbbInvoiceLrDetails(Long invoiceId) {
        TbbInvoiceDTO invoice = tbbInvoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        try {
            List<String> lrIds = new ObjectMapper().readValue(invoice.getLrIdsJson(), List.class);
            List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(lrIds);
            List<com.logic.logistic.model.LrStatementDTO> result = new ArrayList<>();
            for (Booking b : bookings) {
                double gst = b.getSgst() + b.getCgst() + b.getIgst();
                double loadingAmt = b.getLoading() + b.getLoadingCharge();
                double total = b.getFreight() + gst + loadingAmt;
                com.logic.logistic.model.LrStatementDTO lr = new com.logic.logistic.model.LrStatementDTO();
                lr.setLrNumber(b.getLoadingReciept());
                lr.setBookingDate(b.getBookingDate());
                lr.setFromBranch(b.getBranchCode());
                lr.setFromBranchName(resolveBranchName(b.getBranchCode()));
                lr.setToBranch(b.getDestinationBranchCode());
                lr.setToBranchName(resolveBranchName(b.getDestinationBranchCode()));
                lr.setConsigneeName(b.getConsigneeName());
                lr.setFreight(b.getFreight());
                lr.setLoading(loadingAmt);
                lr.setGst(gst);
                lr.setTotal(total);
                lr.setStatus(b.getConsignStatus());
                result.add(lr);
            }
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public void addLrToInvoice(Long invoiceId, String lrNumber) {
        TbbInvoiceDTO invoice = tbbInvoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        try {
            List<String> lrIds = new ObjectMapper().readValue(invoice.getLrIdsJson(), List.class);
            if (!lrIds.contains(lrNumber)) {
                Booking booking = bookingRepository.findByLoadingReciept(lrNumber);
                if (booking == null) throw new RuntimeException("LR not found: " + lrNumber);
                lrIds.add(lrNumber);
                invoice.setLrIdsJson(new ObjectMapper().writeValueAsString(lrIds));
                double gst = booking.getSgst() + booking.getCgst() + booking.getIgst();
                double loadingAmt = booking.getLoading() + booking.getLoadingCharge();
                invoice.setTotalAmount(invoice.getTotalAmount() + booking.getFreight() + gst + loadingAmt);
                tbbInvoiceRepository.save(invoice);
                booking.setConsignStatus("BILLED");
                bookingRepository.save(booking);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to add LR: " + e.getMessage());
        }
    }

    @Override
    public void removeLrFromInvoice(Long invoiceId, String lrNumber) {
        TbbInvoiceDTO invoice = tbbInvoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        try {
            List<String> lrIds = new ObjectMapper().readValue(invoice.getLrIdsJson(), List.class);
            if (lrIds.remove(lrNumber)) {
                invoice.setLrIdsJson(new ObjectMapper().writeValueAsString(lrIds));
                // Recalculate total
                Booking booking = bookingRepository.findByLoadingReciept(lrNumber);
                if (booking != null) {
                    double gst = booking.getSgst() + booking.getCgst() + booking.getIgst();
                    double loadingAmt = booking.getLoading() + booking.getLoadingCharge();
                    double newTotal = Math.max(0, invoice.getTotalAmount() - booking.getFreight() - gst - loadingAmt);
                    invoice.setTotalAmount(newTotal);
                    booking.setConsignStatus("RECEIVED");
                    bookingRepository.save(booking);
                }
                tbbInvoiceRepository.save(invoice);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to remove LR: " + e.getMessage());
        }
    }

    @Override
    public void cancelTbbInvoice(Long invoiceId) {
        TbbInvoiceDTO invoice = tbbInvoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        invoice.setStatus("CANCELLED");
        tbbInvoiceRepository.save(invoice);
        
        try {
            List<String> lrIds = new ObjectMapper().readValue(invoice.getLrIdsJson(), List.class);
            List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(lrIds);
            for (Booking b : bookings) {
                b.setConsignStatus("RECEIVED"); // Assuming it falls back to RECEIVED
            }
            bookingRepository.saveAll(bookings);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void settleTbbInvoice(Long invoiceId) {
        TbbInvoiceDTO invoice = tbbInvoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if ("BILLED".equals(invoice.getStatus())) {
            invoice.setStatus("SETTLED");
            tbbInvoiceRepository.save(invoice);
            // Update all LR statuses to SETTLED
            try {
                List<String> lrIds = new ObjectMapper().readValue(invoice.getLrIdsJson(), List.class);
                List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(lrIds);
                for (Booking b : bookings) {
                    b.setConsignStatus("SETTLED");
                }
                bookingRepository.saveAll(bookings);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public List<TbbInvoiceDTO> getTbbBillReport(String branchCode, boolean allBranches, LocalDateTime fromDate, LocalDateTime toDate) {
        if (allBranches) {
            return tbbInvoiceRepository.findAllByDateRange(fromDate, toDate);
        } else {
            return tbbInvoiceRepository.findByBranchAndDateRange(branchCode, fromDate, toDate);
        }
    }
}
