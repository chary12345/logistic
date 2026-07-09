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
	    List<BookingChargeDetails> chargeDetailsList = bookingChargeRepo.findByLoadingRecieptIn(lrIds);
	    java.util.Map<String, BookingChargeDetails> chargeMap = new java.util.HashMap<>();
	    for (BookingChargeDetails c : chargeDetailsList) {
	        chargeMap.put(c.getLoadingReciept(), c);
	    }

	    return bookings.stream().map(b -> {  // Build StatementDto per booking
	        // Look up BookingChargeDetails – source of truth for all charge values
	        BookingChargeDetails c = chargeMap.get(b.getLoadingReciept());

	        // Individual charges – prefer BookingChargeDetails; fall back to Booking entity
	        double lrCharge             = (c != null) ? c.getLrCharge()             : 0;
	        double hamali               = (c != null) ? c.getHamali()               : 0;
	        double loading              = (c != null) ? c.getLoading()              : b.getLoading();
	        double loadingCharge        = (c != null) ? c.getLoadingCharge()        : b.getLoadingCharge();
	        double stationary           = (c != null) ? c.getStationary()           : 0;
	        double otherChargesAmt      = (c != null) ? c.getOtherCharges()         : 0;  // "Other Charges" charge type
	        double otherTransportCharges = (c != null) ? c.getOtherTransportCharges() : 0;
	        double miscellaneous        = (c != null) ? c.getMiscellaneous()        : 0;
	        double crossingAmount       = (c != null) ? c.getCrossingAmount()       : 0;
	        double podCharges           = (c != null) ? c.getPodCharges()           : 0;
	        double doorDelivery         = (c != null) ? c.getDoorDelivery()         : 0;
	        double doorPickup           = (c != null) ? c.getDoorPickup()           : 0;
	        double ddc                  = (c != null) ? c.getDdc()                  : 0;
	        double dcc                  = (c != null) ? c.getDcc()                  : 0;
	        double demurrage            = (c != null) ? c.getDemurrage()            : 0;
	        double unloading            = (c != null) ? c.getUnloading()            : 0;
	        double localVehicle         = (c != null) ? c.getLocalVehicle()         : 0;
	        double crossingHire         = (c != null) ? c.getCrossingHire()         : 0;

	        // GST – prefer BookingChargeDetails values when non-zero
	        double sgst = b.getSgst();
	        double cgst = b.getCgst();
	        double igst = b.getIgst();
	        if (c != null && (c.getSgst() + c.getCgst() + c.getIgst()) > 0) {
	            sgst = c.getSgst();
	            cgst = c.getCgst();
	            igst = c.getIgst();
	        }
	        double gst = sgst + cgst + igst;

	        // Freight – prefer BookingChargeDetails value when non-zero
	        double freight = (c != null && c.getFreight() > 0) ? c.getFreight() : b.getFreight();

	        // chargesTotal = sum of all non-freight, non-GST charges
	        double chargesTotal = lrCharge + hamali + loading + loadingCharge + stationary
	                + otherChargesAmt + otherTransportCharges + miscellaneous
	                + crossingAmount + podCharges + doorDelivery + doorPickup
	                + ddc + dcc + demurrage + unloading + localVehicle + crossingHire;

	        // Total – use stored totalAmount from BookingChargeDetails when available
	        double total;
	        if (c != null && c.getTotalAmount() > 0) {
	            total = c.getTotalAmount();
	        } else {
	            total = freight + gst + chargesTotal;
	        }

	        // Populate DTO with full charge breakdown
	        StatementDto dto = new StatementDto();
	        dto.setLoadingReciept(b.getLoadingReciept());
	        dto.setBookingDate(b.getBookingDate());
	        dto.setDispatchDate(b.getDispatchDate());
	        dto.setConsignorName(b.getConsignorName());
	        dto.setConsigneeName(b.getConsigneeName());
	        dto.setBillType(b.getBillType());
	        dto.setConsignStatus(b.getConsignStatus());
	        // Amounts
	        dto.setFreight(freight);
	        // Individual charge breakdown
	        dto.setLrCharge(lrCharge);
	        dto.setHamali(hamali);
	        dto.setLoading(loading);
	        dto.setLoadingCharge(loadingCharge);
	        dto.setStationary(stationary);
	        dto.setOtherChargesAmt(otherChargesAmt);
	        dto.setOtherTransportCharges(otherTransportCharges);
	        dto.setMiscellaneous(miscellaneous);
	        dto.setCrossingAmount(crossingAmount);
	        dto.setPodCharges(podCharges);
	        dto.setDoorDelivery(doorDelivery);
	        dto.setDoorPickup(doorPickup);
	        dto.setDdc(ddc);
	        dto.setDcc(dcc);
	        dto.setDemurrage(demurrage);
	        dto.setUnloading(unloading);
	        dto.setLocalVehicle(localVehicle);
	        dto.setCrossingHire(crossingHire);
	        // GST components
	        dto.setSgst(sgst);
	        dto.setCgst(cgst);
	        dto.setIgst(igst);
	        dto.setGst(gst);
	        // Derived totals
	        dto.setChargesTotal(chargesTotal);
	        dto.setTotal(total);
	        return dto;

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

        // Snapshot each LR's current status before overwriting with BILLED
        List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(lrIds);
        java.util.Map<String, String> prevStatuses = new java.util.LinkedHashMap<>();
        for (Booking b : bookings) {
            prevStatuses.put(b.getLoadingReciept(), b.getConsignStatus());
        }
        try {
            invoice.setPreviousLrStatusesJson(new ObjectMapper().writeValueAsString(prevStatuses));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        tbbInvoiceRepository.save(invoice);

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
        if (invoiceNumber != null && !invoiceNumber.isEmpty() && fromDate != null && toDate != null) {
            return tbbInvoiceRepository.findByInvoiceNumber(invoiceNumber).stream()
                .filter(inv -> inv.getFromBranch().equals(branchCode) && 
                               !inv.getCreatedAt().isBefore(fromDate) && 
                               !inv.getCreatedAt().isAfter(toDate))
                .collect(Collectors.toList());
        }
        // Search by invoice number only
        if (invoiceNumber != null && !invoiceNumber.isEmpty()) {
            return tbbInvoiceRepository.findByInvoiceNumber(invoiceNumber)
                .map(inv -> inv.getFromBranch().equals(branchCode) ? java.util.Collections.singletonList(inv) : new ArrayList<TbbInvoiceDTO>())
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

        // Self-heal: CANCELLED bills must have no LRs associated
        if ("CANCELLED".equals(invoice.getStatus())) {
            try {
                List<String> lrIds = new ObjectMapper().readValue(
                    invoice.getLrIdsJson() != null ? invoice.getLrIdsJson() : "[]", List.class);
                if (!lrIds.isEmpty()) {
                    // Load the previous-status snapshot (saved at bill-generation time)
                    java.util.Map<String, String> prevStatuses = new java.util.HashMap<>();
                    if (invoice.getPreviousLrStatusesJson() != null) {
                        prevStatuses = new ObjectMapper().readValue(
                            invoice.getPreviousLrStatusesJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {});
                    }
                    final java.util.Map<String, String> statusMap = prevStatuses;
                    List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(lrIds);
                    for (Booking b : bookings) {
                        // Restore to original pre-billing status; fall back to RECEIVED for legacy bills
                        String original = statusMap.getOrDefault(b.getLoadingReciept(), "RECEIVED");
                        b.setConsignStatus(original);
                    }
                    bookingRepository.saveAll(bookings);
                    // Clear LR association on the cancelled invoice
                    invoice.setLrIdsJson("[]");
                    tbbInvoiceRepository.save(invoice);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return new ArrayList<>(); // Cancelled bill shows no LRs
        }

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

                booking.setConsignStatus("BILLED");
                bookingRepository.save(booking);
            }

            // If adding to a cancelled bill (even if LR was partially added before), revive it back to BILLED status and update date
            if ("CANCELLED".equals(invoice.getStatus())) {
                invoice.setStatus("BILLED");
                invoice.setCreatedAt(LocalDateTime.now());
            }

            tbbInvoiceRepository.save(invoice);
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
                    
                    // Restore exact original status from snapshot; fall back to RECEIVED if no snapshot
                    String original = "RECEIVED";
                    if (invoice.getPreviousLrStatusesJson() != null) {
                        java.util.Map<String, String> prevStatuses = new ObjectMapper().readValue(
                            invoice.getPreviousLrStatusesJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {}
                        );
                        original = prevStatuses.getOrDefault(lrNumber, "RECEIVED");
                    }
                    booking.setConsignStatus(original);
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

        try {
            List<String> lrIds = new ObjectMapper().readValue(invoice.getLrIdsJson(), List.class);
            if (lrIds != null && !lrIds.isEmpty()) {
                // Load the original status snapshot captured at bill generation time
                java.util.Map<String, String> prevStatuses = new java.util.HashMap<>();
                if (invoice.getPreviousLrStatusesJson() != null) {
                    prevStatuses = new ObjectMapper().readValue(
                        invoice.getPreviousLrStatusesJson(),
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {}
                    );
                }
                final java.util.Map<String, String> statusMap = prevStatuses;
                List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(lrIds);
                for (Booking b : bookings) {
                    // Restore exact original status; fall back to RECEIVED for old bills without snapshot
                    String original = statusMap.getOrDefault(b.getLoadingReciept(), "RECEIVED");
                    b.setConsignStatus(original);
                }
                bookingRepository.saveAll(bookings);
            }
            // Clear LR association so the cancelled bill card shows no LRs
            invoice.setLrIdsJson("[]");
        } catch (Exception e) {
            e.printStackTrace();
        }

        invoice.setStatus("CANCELLED");
        invoice.setTotalAmount(0.0); // Reset amount to 0 for cancelled bills
        invoice.setCreatedAt(LocalDateTime.now()); // Update date to cancellation time
        tbbInvoiceRepository.save(invoice);
    }


    @Override
    public void settleTbbInvoice(Long invoiceId) {
        TbbInvoiceDTO invoice = tbbInvoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if ("BILLED".equals(invoice.getStatus())) {
            invoice.setStatus("SETTLED");
            tbbInvoiceRepository.save(invoice);

        }
    }

    @Override
    public List<TbbInvoiceDTO> getTbbBillReport(String branchCode, boolean allBranches, String companyCode, LocalDateTime fromDate, LocalDateTime toDate) {
        if (allBranches) {
            if (companyCode != null && !companyCode.isEmpty()) {
                List<String> branchCodes = branchRepo.getbranchesListByCompanyCode(companyCode)
                    .stream().map(com.logic.logistic.model.BranchMap::getBranchCode).collect(Collectors.toList());
                return tbbInvoiceRepository.findByFromBranchInAndDateRange(branchCodes, fromDate, toDate);
            }
            return tbbInvoiceRepository.findAllByDateRange(fromDate, toDate);
        } else {
            return tbbInvoiceRepository.findByBranchAndDateRange(branchCode, fromDate, toDate);
        }
    }
}
