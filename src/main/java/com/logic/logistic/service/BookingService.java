package com.logic.logistic.service;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.springframework.beans.factory.annotation.Autowired;
//For paged result
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
//For pagination
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.BookingReceiptSequence;
import com.logic.logistic.model.BookingDTO;
import com.logic.logistic.model.BookingPageResponse;
import com.logic.logistic.repository.BookRepository;
import com.logic.logistic.repository.BookingReceiptSequenceRepository;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

	private static final long serialVersionUID = 1L;

	private static org.apache.logging.log4j.Logger logger = LogManager.getLogger();

	@Autowired
	private BookingReceiptSequenceRepository sequenceRepo;

	@Autowired
	private BookRepository bookingRepo;

	@Transactional
	public Booking saveBooking(BookingDTO dto) {
		String key = dto.getCompanyCode() + dto.getBranchCode();
		Booking save = null;
		try {
			BookingReceiptSequence sequence = sequenceRepo.findById(key).orElseGet(() -> {
				BookingReceiptSequence s = new BookingReceiptSequence();
				s.setKeyCode(key);
				s.setLastNumber(0);
				logger.info("set key and 0 to BookingReceiptSequence: " + s);
				return s;

			});

			int newSerial = sequence.getLastNumber() + 1;
			sequence.setLastNumber(newSerial);
			sequenceRepo.save(sequence);

			String loadingReceipt = key + String.format("%03d", newSerial);

			Booking booking = new Booking();
			booking.setLoadingReciept(loadingReceipt);

			if (dto.getConsignorName() != null)
				booking.setConsignorName(dto.getConsignorName());
			if (dto.getConsignorMobile() != null)
				booking.setConsignorMobile(dto.getConsignorMobile());
			if (dto.getConsignorAddress() != null)
				booking.setConsignorAddress(dto.getConsignorAddress());

			if (dto.getConsigneeName() != null)
				booking.setConsigneeName(dto.getConsigneeName());
			if (dto.getConsigneeMobile() != null)
				booking.setConsigneeMobile(dto.getConsigneeMobile());
			if (dto.getConsigneeAddress() != null)
				booking.setConsigneeAddress(dto.getConsigneeAddress());

			if (dto.getArticleType() != null)
				booking.setArticleType(dto.getArticleType());
			booking.setArticleWeight(dto.getArticleWeight());
			booking.setFreight(dto.getFreight());

			booking.setSgst(dto.getSgst());
			booking.setCgst(dto.getCgst());
			booking.setIgst(dto.getIgst());

			booking.setBookingDate(LocalDateTime.now());
			booking.setConsignStatus("BOOKED");

			if (dto.getInvoiceNumber() != null)
				booking.setInvoiceNumber(dto.getInvoiceNumber());
			booking.setInvoiceValue(dto.getInvoiceValue());
			if (dto.geteWayBillNumber() != null)
				booking.seteWayBillNumber(dto.geteWayBillNumber());
			if (dto.getBillType() != null)
				booking.setBillType(dto.getBillType());
			
			if (dto.getBranchCode() != null)
				booking.setBranchCode(dto.getBranchCode());

			save = bookingRepo.save(booking);
		} catch (Exception e) {
			System.out.println(e.getMessage());
			logger.error("Exception in saveBooking: " + e);
		}
		return save;
	}

	public BookingPageResponse getBookingReportsBetweenDates(LocalDateTime fromDate, LocalDateTime toDate,
			String status) {
		Pageable pageable = PageRequest.of(0, 10, Sort.by("bookingDate").descending());

		try {
			Page<Booking> page = bookingRepo.findByBookingDateBetween(fromDate, toDate, status, pageable);
			BookingPageResponse response = new BookingPageResponse();
			response.setContent(page.getContent());
			response.setPageNumber(page.getNumber());
			response.setPageSize(page.getSize());
			response.setTotalElements(page.getTotalElements());
			response.setTotalPages(page.getTotalPages());
			response.setLast(page.isLast());

			logger.info("BookingPageResponse: " + response);
			return response;
		} catch (Exception e) {
			logger.info("error BookingPageResponse: " + e.getLocalizedMessage());
			return null;
		}
	}

	@Transactional
	public List<Booking> dispatchLoad(List<String> loadingReceipts) {
		List<Booking> dispatchBookings = null;
		try {
			dispatchBookings = bookingRepo.findByLoadingRecieptIn(loadingReceipts);
			LocalDateTime now = LocalDateTime.now();
			for (Booking booking : dispatchBookings) {
				booking.setConsignStatus("DISPATCHED");
				booking.setDispatchDate(now);
			}

			bookingRepo.saveAll(dispatchBookings);
			logger.info("save all dispatchbookings : ");

		} catch (Exception e) {
			System.out.println(e.getMessage());
			logger.error("Exception in dispatchLoad : " + e);
		}
		return dispatchBookings;
	}

	public BookingPageResponse getReports(LocalDateTime from, LocalDateTime to, String status, String lastId,String branchCode) {
	    int limit = 10;
	    Pageable pageable = PageRequest.of(0, limit, Sort.by("bookingDate").descending());
	    List<Booking> bookings;

	    if (lastId == null) {
	        bookings = bookingRepo.findFirstPage(from, to, status, pageable,branchCode);
	    } else {
	        bookings = bookingRepo.findNextPage(from, to, status, lastId, pageable,branchCode);
	    }

	    BookingPageResponse response = new BookingPageResponse();
	    response.setContent(bookings);
	    response.setPageSize(limit);
	    response.setPageNumber(0);
	    response.setTotalElements(bookings.size());
	    response.setTotalPages(1);
	    response.setLast(bookings.size() < limit);

	    return response;
	}

}
