package com.logic.logistic.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
//For pagination
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.ArticleDetailDto;
import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.BookingReceiptSequence;
import com.logic.logistic.dto.BookingSearchRequest;
import com.logic.logistic.dto.LoadingSheetDTO;
import com.logic.logistic.mapper.LoadingSheetMapper;
import com.logic.logistic.model.ArticleDetail;
import com.logic.logistic.model.BookingDTO;
import com.logic.logistic.model.BookingPageResponse;
import com.logic.logistic.model.DispatchRequest;
import com.logic.logistic.model.DispatchResponse;
import com.logic.logistic.repository.ArticleDetailRepository;
import com.logic.logistic.repository.BookRepository;
import com.logic.logistic.repository.BookingReceiptSequenceRepository;
import com.logic.logistic.repository.LoadingSheetRepository;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

	private static final long serialVersionUID = 1L;

	private static org.apache.logging.log4j.Logger logger = LogManager.getLogger();

	@Autowired
	private BookingReceiptSequenceRepository sequenceRepo;

	@Autowired
	private BookRepository bookingRepo;

	@Autowired
	private ArticleDetailRepository articleRepo;

	@Autowired
	private LoadingSheetRepository loadingSheetRepository;
	
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
			booking.setLoading(dto.getLoading());
			booking.setLoadingCharge(dto.getLoadingCharge());
			
			saveBookingArticles(loadingReceipt, dto.getArticleDetails());
			booking.setSgst(dto.getSgst());
			booking.setCgst(dto.getCgst());
			booking.setIgst(dto.getIgst());
			booking.setFreight(dto.getFreight());

			booking.setBookingDate(LocalDateTime.now());
			booking.setConsignStatus("BOOKED");

			if (dto.getInvoiceNumber() != null)
				booking.setInvoiceNumber(dto.getInvoiceNumber());
			booking.setInvoiceValue(dto.getInvoiceValue());
			if (dto.geteWayBillNumber() != null)
				booking.seteWayBillNumber(dto.geteWayBillNumber());
			if (dto.getBillType() != null) {
				booking.setBillType(dto.getBillType());
				if (dto.getBillType().equalsIgnoreCase("TO PAY") || dto.getBillType().equalsIgnoreCase("PAID")
						|| dto.getBillType().equalsIgnoreCase("TBD")) {
					booking.setBookingtype("AUTO");
				} else {
					booking.setBookingtype("MANUAL");
				}
			}

			if (dto.getBranchCode() != null)
				booking.setBranchCode(dto.getBranchCode());
			if (dto.getDestinationBranchCode() != null)
				booking.setDestinationBranchCode(dto.getDestinationBranchCode());
			if (dto.getEmployeeName() != null)
				booking.setEmployeeName(dto.getEmployeeName());
			save = bookingRepo.save(booking);
			logger.info("booking saved:: " + save.getLoadingReciept());
		} catch (Exception e) {
			
			logger.error("Exception in saveBooking: " + e);
		}
		return save;
	}

	/*
	 * public BookingPageResponse getBookingReportsBetweenDates(LocalDateTime
	 * fromDate, LocalDateTime toDate, String status) {
	 * 
	 * try { List<Booking> page = bookingRepo.findByBookingDateBetween(fromDate,
	 * toDate, "BOOKED"); BookingPageResponse response = new BookingPageResponse();
	 * response.setContent(page);
	 * 
	 * logger.info("BookingPageResponse: " + response); return response; } catch
	 * (Exception e) { logger.info("error BookingPageResponse: " +
	 * e.getLocalizedMessage()); return null; } }
	 */

	@Transactional
	public DispatchResponse dispatchLoad(DispatchRequest request) {
	    DispatchResponse response = new DispatchResponse();

	    try {
	        List<Booking> dispatchBookings = bookingRepo.findByLoadingRecieptIn(request.getLrIds());
	        LocalDateTime now = LocalDateTime.now();

	        for (Booking booking : dispatchBookings) {
	            booking.setConsignStatus("DISPATCHED");
	            booking.setDispatchDate(now);
	        }

	        bookingRepo.saveAll(dispatchBookings);

	        // Save loading sheet
	        LoadingSheetDTO sheet = LoadingSheetMapper.fromRequest(request);
	        sheet.setCreatedAt(now); // ensure created timestamp
	        LoadingSheetDTO savedSheet = loadingSheetRepository.save(sheet);

	        response.setBookings(dispatchBookings);
	        response.setLoadingSheet(savedSheet);

	        logger.info("Dispatch and loading sheet saved");

	    } catch (Exception e) {
	        logger.error("Exception in dispatchLoad : " + e.getMessage());
	        
	    }

	    return response;
	}


	public BookingPageResponse getReports(LocalDateTime from, LocalDateTime to, String status, String lastId,
			String branchCode) {
		int limit = 10;
		Pageable pageable = PageRequest.of(0, limit, Sort.by("bookingDate").descending());
		List<Booking> bookings;

		if (lastId == null) {
			bookings = bookingRepo.findFirstPage(from, to, status, pageable, branchCode);
		} else {
			bookings = bookingRepo.findNextPage(from, to, status, lastId, pageable, branchCode);
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

	public void saveBookingArticles(String lrNumber, List<ArticleDetail> details) {
		ArrayList<ArticleDetailDto> dtoList = new ArrayList<ArticleDetailDto>();
		try {
			for (ArticleDetail detail : details) {
				ArticleDetailDto dto = new ArticleDetailDto();
				dto.setLoadingReciept(lrNumber);
				dto.setArtAmt(detail.getArtAmt());
				dto.setArticle(detail.getArticle());
				dto.setArtQty(detail.getArtQty());
				dto.setArtType(detail.getArtType());
				dto.setSaidToContain(detail.getSaidToContain());
				dto.setTotal(detail.getTotal());
				dto.setCompanyCode(detail.getCompanyCode());

				dtoList.add(dto);
			}
			articleRepo.saveAll(dtoList);
		} catch (Exception e) {
			logger.error("unable to save article details :: ", e.getMessage());
		}
	}

	public BookingDTO findByLoadingReciept(String lr) {
		// Fetch articleDetails from table
		Booking bookingByLr = bookingRepo.findByLoadingReciept(lr);
		BookingDTO dto = null;
		if (bookingByLr != null) {
			dto = new BookingDTO();
			List<ArticleDetailDto> articleBylr = articleRepo.findByLoadingReciept(lr);
			List<ArticleDetail> articleDetails = convertToArticleDetailList(articleBylr);

			// Map Booking to DTO

			BeanUtils.copyProperties(bookingByLr, dto);

			dto.setArticleDetails(articleDetails);
		}
		return dto;
	}

	public List<ArticleDetail> convertToArticleDetailList(List<ArticleDetailDto> dtoList) {
		List<ArticleDetail> details = new ArrayList<>();

		for (ArticleDetailDto dto : dtoList) {
			ArticleDetail detail = new ArticleDetail();
			detail.setArticle(dto.getArticle());
			detail.setArtQty(dto.getArtQty());
			detail.setArtType(dto.getArtType());
			detail.setSaidToContain(dto.getSaidToContain());
			detail.setArtAmt(dto.getArtAmt());
			detail.setTotal(dto.getTotal());
			detail.setCompanyCode(dto.getCompanyCode());

			details.add(detail);
		}
		return details;
	}

	public Booking updateBooking(String lr, BookingDTO dto) {
		Booking existing = bookingRepo.findById(lr).orElseThrow(() -> new RuntimeException("LR not found"));

		// Update fields
		existing.setLoadingReciept(lr);
		existing.setConsignorName(dto.getConsignorName());
		existing.setConsignorMobile(dto.getConsignorMobile());
		existing.setConsignorAddress(dto.getConsignorAddress());
		existing.setConsigneeName(dto.getConsigneeName());
		existing.setConsigneeMobile(dto.getConsigneeMobile());
		existing.setConsigneeAddress(dto.getConsigneeAddress());
		existing.setFreight(dto.getFreight());
		existing.setSgst(dto.getSgst());
		existing.setCgst(dto.getCgst());
		existing.setIgst(dto.getIgst());
		existing.setInvoiceNumber(dto.getInvoiceNumber());
		existing.setInvoiceValue(dto.getInvoiceValue());
		existing.seteWayBillNumber(dto.geteWayBillNumber());
		existing.setDestinationBranchCode(dto.getDestinationBranchCode());
		existing.setBillType(dto.getBillType());
		existing.setModifiedDate(LocalDateTime.now());

		articleRepo.deleteByLoadingReciept(lr);

		saveArticles(lr, dto.getArticleDetails());
		bookingRepo.save(existing);

		return existing;
	}

	private void saveArticles(String lr, List<ArticleDetail> details) {
		if (details != null) {
			for (ArticleDetail d : details) {
				ArticleDetailDto dto = new ArticleDetailDto();
				BeanUtils.copyProperties(d, dto);
				dto.setLoadingReciept(lr);
				articleRepo.save(dto);
			}
		}
	}

//	public BookingPageResponse getGlobalSearchreports(LocalDateTime fromDate, LocalDateTime toDate, String lastId,
//			String branchCode) {
//		int limit = 10;
//		Pageable pageable = PageRequest.of(0, limit, Sort.by("bookingDate").descending());
//		List<Booking> bookings;
//
//		if (lastId == null) {
//			bookings = bookingRepo.findFirstPageForGlobalSearchreports(fromDate, toDate, pageable, branchCode);
//		} else {
//			bookings = bookingRepo.findNextPageForGlobalSearchreports(fromDate, toDate, lastId, pageable, branchCode);
//		}
//
//		BookingPageResponse response = new BookingPageResponse();
//		response.setContent(bookings);
//		response.setPageSize(limit);
//		response.setPageNumber(0);
//		response.setTotalElements(bookings.size());
//		response.setTotalPages(1);
//		response.setLast(bookings.size() < limit);
//
//		return response;
//	}

	public BookingPageResponse getGlobalSearchReports(BookingSearchRequest request) {
	    int limit = 10;
	    Pageable pageable = PageRequest.of(0, limit, Sort.by("bookingDate").descending());

	    List<String> branchCodes = bookingRepo.getlistofBranchcodes(
	        request.getCity(),
	        request.getState(),
	        request.getBranchCode()
	    );

	    if (branchCodes.isEmpty()) {
	        return new BookingPageResponse(); // empty if no branches
	    }

	    List<Booking> bookings = bookingRepo.searchBookings(
	        request.getFromDate(),
	        request.getToDate(),
	        request.getStatus(),
	        request.getLastId(),
	        branchCodes,
	        pageable
	    );

	    BookingPageResponse response = new BookingPageResponse();
	    response.setContent(bookings);
	    response.setPageSize(limit);
	    response.setPageNumber(request.getPage());
	    response.setTotalElements(bookings.size());
	    response.setTotalPages(1);
	    response.setLast(bookings.size() < limit);
	    response.setLastId(bookings.isEmpty() ? null : bookings.get(bookings.size() - 1).getLoadingReciept());

	    return response;
	}

	public List<String> getSaidToContainsByCompany(String companyCode) {
		 return articleRepo.findDistinctSaidToContainsByCompanyCode(companyCode);
	}




}
