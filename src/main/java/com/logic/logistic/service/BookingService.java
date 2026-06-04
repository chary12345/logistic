package com.logic.logistic.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.logic.logistic.dto.*;
import com.logic.logistic.model.*;
import com.logic.logistic.repository.*;
import org.apache.logging.log4j.LogManager;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
//For pagination
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.logic.logistic.mapper.LoadingSheetMapper;

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

	@Autowired
	private BookingChargeDetailsRepo bookingChargeRepo;

	@Autowired
	private EmailService emailService;

	@Autowired
	private BranchRepo branchRepo;

	@Autowired
	private CompanyRegisterrepo companyRegisterrepo;
	
	@Transactional
	public BookingResponseDTO saveBooking(BookingDTO dto) {
		String key =  dto.getBranchCode();
		Booking save = null;
		BookingResponseDTO response = new BookingResponseDTO();
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

			String loadingReceipt = key+"/" + String.format("%03d", newSerial);

			Booking booking = new Booking();
			booking.setLoadingReciept(loadingReceipt);

			if (dto.getConsignorName() != null)
				booking.setConsignorName(dto.getConsignorName());
			if (dto.getConsignorMobile() != null)
				booking.setConsignorMobile(dto.getConsignorMobile());
			if (dto.getConsignorAddress() != null)
				booking.setConsignorAddress(dto.getConsignorAddress());
			if (dto.getConsignorGST() != null)
				booking.setConsignorGST(dto.getConsignorGST());

			if (dto.getConsigneeName() != null)
				booking.setConsigneeName(dto.getConsigneeName());
			if (dto.getConsigneeMobile() != null)
				booking.setConsigneeMobile(dto.getConsigneeMobile());
			if (dto.getConsigneeAddress() != null)
				booking.setConsigneeAddress(dto.getConsigneeAddress());
			if (dto.getConsigneeGST() != null)
				booking.setConsigneeGST(dto.getConsigneeGST());
			if (dto.getPartyName() != null)
				booking.setPartyName(dto.getPartyName());
			if (dto.getGstPaidBy() != null)
				booking.setGstPaidBy(dto.getGstPaidBy());
			if (dto.getDeliveryType() != null)
				booking.setDeliveryType(dto.getDeliveryType());

			List<ArticleDetailDto> articleDetailDtos = saveBookingArticles(loadingReceipt, dto.getArticleDetails());
			BookingChargeDetails bookingChargeDetails = saveBookingCharges(loadingReceipt, dto);

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
			if (dto.getPaidVia() != null)
				booking.setPaidVia(dto.getPaidVia());
			
			if (dto.getRemarks() != null)
				booking.setRemarks(dto.getRemarks());
			
			if (dto.geteWayBillNumbers() != null && !dto.geteWayBillNumbers().isEmpty()) {
				booking.seteWayBillNumbers(String.join(",", dto.geteWayBillNumbers()));
				// Set first bill for compatibility
				booking.seteWayBillNumber(dto.geteWayBillNumbers().get(0));
			}

			// Sync charges to booking
			booking.setFreight(dto.getFreight());
			booking.setLoading(dto.getLoading());
			booking.setLoadingCharge(dto.getLoadingCharge());
			booking.setSgst(dto.getSgst());
			booking.setCgst(dto.getCgst());
			booking.setIgst(dto.getIgst());

			save = bookingRepo.save(booking);
			save.setNextLr(key+"/" + String.format("%03d", newSerial+1));
			logger.info("booking saved:: " + save.getLoadingReciept());

			response.setBooking(save);
			response.setArticles(articleDetailDtos);
			response.setCharges(bookingChargeDetails);
			
			try {
				dto.setLoadingReciept(loadingReceipt);
				String branchCodeToUse = dto.getBranchCode() != null ? dto.getBranchCode() : booking.getBranchCode();
				String companyCodeToUse = dto.getCompanyCode() != null ? dto.getCompanyCode() : booking.getCompanyCode();
				com.logic.logistic.dto.BranchDTO branch = branchCodeToUse != null ? branchRepo.getBranchBybranchCode(branchCodeToUse) : null;
				com.logic.logistic.dto.CompanyDto company = companyCodeToUse != null ? companyRegisterrepo.getCompanyByID(companyCodeToUse) : null;
				if (branch != null && branch.getBranchEmail() != null && !branch.getBranchEmail().isBlank()) {
					emailService.sendBookingEmail(branch.getBranchEmail(), dto, 
						company != null ? company.getCompanyFullName() : "", 
						branch.getBranchName(), false);
				}
			} catch (Exception ex) {
				logger.error("Failed to trigger booking create email: " + ex.getMessage());
			}
		} catch (Exception e) {
			logger.error("Exception in saveBooking: " + e);
		}

		return response;
	}


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


	public BookingPageResponse getReports(
			LocalDateTime from,
			LocalDateTime to,
			String status,
			String lastId,
			String branchCode) {

		int limit = 10;

		Pageable pageable =
				PageRequest.of(
						0,
						limit,
						Sort.by("bookingDate").descending()
				);

		List<Booking> bookings;

		if (lastId == null) {

			bookings = bookingRepo.findFirstPage(
					from,
					to,
					status,
					pageable,
					branchCode
			);

		} else {

			bookings = bookingRepo.findNextPage(
					from,
					to,
					status,
					lastId,
					pageable,
					branchCode
			);
		}

		List<BookingReportDTO> reportList =
				new ArrayList<>();

		for (Booking booking : bookings) {

			BookingReportDTO dto =
					new BookingReportDTO();

			dto.setBooking(booking);

			BookingChargeDetails charges =
					bookingChargeRepo
							.findByLoadingReciept(
									booking.getLoadingReciept()
							)
							.orElse(null);

			dto.setCharges(charges);

			reportList.add(dto);
		}

		BookingPageResponse response =
				new BookingPageResponse();

		response.setContent(reportList);

		response.setPageSize(limit);

		response.setPageNumber(0);

		response.setTotalElements(reportList.size());

		response.setTotalPages(1);

		response.setLast(reportList.size() < limit);

		if (!bookings.isEmpty()) {

			response.setLastId(
					bookings.get(
							bookings.size() - 1
					).getLoadingReciept()
			);
		}

		return response;
	}

	public List<ArticleDetailDto> saveBookingArticles(String lrNumber, List<ArticleDetail> details) {
		ArrayList<ArticleDetailDto> dtoList = new ArrayList<ArticleDetailDto>();
		List<ArticleDetailDto> articleDetailDtos=new ArrayList<ArticleDetailDto>();
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
			 articleDetailDtos = articleRepo.saveAll(dtoList);

		} catch (Exception e) {
			logger.error("unable to save article details :: ", e.getMessage());
		}

        return articleDetailDtos;
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

			if (bookingByLr.geteWayBillNumbers() != null) {
				dto.seteWayBillNumbers(java.util.Arrays.asList(bookingByLr.geteWayBillNumbers().split(",")));
			}
			dto.setRemarks(bookingByLr.getRemarks());

			dto.setArticleDetails(articleDetails);

			// Full charge breakdown lives in booking_charge_details; merge for edit/search UI
			java.util.Optional<BookingChargeDetails> chargeDetails =
					bookingChargeRepo.findByLoadingReciept(lr);
			if (chargeDetails.isPresent()) {
				BeanUtils.copyProperties(
						chargeDetails.get(),
						dto,
						"id",
						"loadingReciept",
						"createdDate",
						"modifiedDate");
			}
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

	@Transactional
	public BookingResponseDTO updateBooking(String lr, BookingDTO dto) {
		Booking existing = bookingRepo.findById(lr).orElseThrow(() -> new RuntimeException("LR not found"));

		// Update fields
		existing.setLoadingReciept(lr);
		existing.setConsignorName(dto.getConsignorName());
		existing.setConsignorMobile(dto.getConsignorMobile());
		existing.setConsignorAddress(dto.getConsignorAddress());
		existing.setConsignorGST(dto.getConsignorGST());
		existing.setConsigneeName(dto.getConsigneeName());
		existing.setConsigneeMobile(dto.getConsigneeMobile());
		existing.setConsigneeAddress(dto.getConsigneeAddress());
		existing.setConsigneeGST(dto.getConsigneeGST());
		existing.setFreight(dto.getFreight());
		existing.setSgst(dto.getSgst());
		existing.setCgst(dto.getCgst());
		existing.setIgst(dto.getIgst());
		existing.setLoading(dto.getLoading());
		existing.setLoadingCharge(dto.getLoadingCharge());
		existing.setInvoiceNumber(dto.getInvoiceNumber());
		existing.setInvoiceValue(dto.getInvoiceValue());
		existing.setDestinationBranchCode(dto.getDestinationBranchCode());
		existing.setBillType(dto.getBillType());
		existing.setRemarks(dto.getRemarks());
		existing.setPaidVia(dto.getPaidVia());
		existing.setPartyName(dto.getPartyName());
		existing.setGstPaidBy(dto.getGstPaidBy());
		existing.setDeliveryType(dto.getDeliveryType());

		if (dto.geteWayBillNumbers() != null && !dto.geteWayBillNumbers().isEmpty()) {
			existing.seteWayBillNumbers(String.join(",", dto.geteWayBillNumbers()));
			existing.seteWayBillNumber(dto.geteWayBillNumbers().get(0));
		} else if (dto.geteWayBillNumber() != null) {
			existing.seteWayBillNumber(dto.geteWayBillNumber());
			existing.seteWayBillNumbers(dto.geteWayBillNumber());
		}

		existing.setModifiedDate(LocalDateTime.now());

		BookingChargeDetails charges = saveBookingCharges(lr, dto);

		articleRepo.deleteByLoadingReciept(lr);

		List<ArticleDetailDto> articles = saveBookingArticles(lr, dto.getArticleDetails());
		existing = bookingRepo.save(existing);

		try {
			dto.setLoadingReciept(lr);
			String branchCodeToUse = dto.getBranchCode() != null ? dto.getBranchCode() : existing.getBranchCode();
			String companyCodeToUse = dto.getCompanyCode() != null ? dto.getCompanyCode() : existing.getCompanyCode();
			com.logic.logistic.dto.BranchDTO branch = branchCodeToUse != null ? branchRepo.getBranchBybranchCode(branchCodeToUse) : null;
			com.logic.logistic.dto.CompanyDto company = companyCodeToUse != null ? companyRegisterrepo.getCompanyByID(companyCodeToUse) : null;
			if (branch != null && branch.getBranchEmail() != null && !branch.getBranchEmail().isBlank()) {
				emailService.sendBookingEmail(branch.getBranchEmail(), dto, 
					company != null ? company.getCompanyFullName() : "", 
					branch.getBranchName(), true);
			}
		} catch (Exception ex) {
			logger.error("Failed to trigger booking update email: " + ex.getMessage());
		}

		BookingResponseDTO response = new BookingResponseDTO();
		response.setBooking(existing);
		response.setCharges(charges);
		response.setArticles(articles);
		return response;
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

	public BookingPageResponse getGlobalSearchReports(
			BookingSearchRequest request) {

		int limit = 10;

		Pageable pageable =
				PageRequest.of(
						0,
						limit,
						Sort.by("bookingDate").descending()
				);

		List<String> branchCodes =
				bookingRepo.getlistofBranchcodes(

						normalize(request.getCity()),

						normalize(request.getState()),

						normalize(request.getBranchCode()),

						request.getCompanyCode()
				);

		if (branchCodes.isEmpty()) {

			return new BookingPageResponse();
		}

		List<Booking> bookings =
				bookingRepo.searchBookings(

						request.getFromDate(),

						request.getToDate(),

						request.getStatus(),

						request.getLastId(),

						branchCodes,

						pageable
				);

		// 🔥 NEW REPORT DTO LIST
		List<BookingReportDTO> reportList =
				new ArrayList<>();

		for (Booking booking : bookings) {

			BookingReportDTO dto =
					new BookingReportDTO();

			// booking
			dto.setBooking(booking);

			// charges
			BookingChargeDetails charges =
					bookingChargeRepo
							.findByLoadingReciept(
									booking.getLoadingReciept()
							)
							.orElse(null);

			dto.setCharges(charges);

			reportList.add(dto);
		}

		BookingPageResponse response =
				new BookingPageResponse();

		response.setContent(reportList);

		response.setPageSize(limit);

		response.setPageNumber(
				request.getPage()
		);

		response.setTotalElements(
				reportList.size()
		);

		response.setTotalPages(1);

		response.setLast(
				reportList.size() < limit
		);

		response.setLastId(

				bookings.isEmpty()

						? null

						: bookings.get(
						bookings.size() - 1
				).getLoadingReciept()
		);

		return response;
	}

	public List<String> getSaidToContainsByCompany(String companyCode) {
		 return articleRepo.findDistinctSaidToContainsByCompanyCode(companyCode);
	}

	public BookingChargeDetails saveBookingCharges(String lrNumber, BookingDTO dto) {
		BookingChargeDetails chargeData = null;
		try {
			LocalDateTime now = LocalDateTime.now();

			// Update existing row instead of delete/insert to avoid transaction flush conflicts
			BookingChargeDetails charges = bookingChargeRepo.findByLoadingReciept(lrNumber).orElseGet(BookingChargeDetails::new);

			charges.setLoadingReciept(lrNumber);
			if (charges.getCreatedDate() == null) {
				charges.setCreatedDate(now);
			}

			charges.setLrCharge(dto.getLrCharge());

			charges.setHamali(dto.getHamali());

			charges.setLoading(dto.getLoading());

			charges.setStationary(dto.getStationary());

			charges.setOtherCharges(dto.getOtherCharges());

			charges.setOtherTransportCharges(
					dto.getOtherTransportCharges()
			);

			charges.setMiscellaneous(
					dto.getMiscellaneous()
			);

			charges.setCrossingAmount(
					dto.getCrossingAmount()
			);

			charges.setPodCharges(
					dto.getPodCharges()
			);

			charges.setDoorDelivery(
					dto.getDoorDelivery()
			);

			charges.setDoorPickup(
					dto.getDoorPickup()
			);

			charges.setDdc(dto.getDdc());

			charges.setDcc(dto.getDcc());

			charges.setDemurrage(
					dto.getDemurrage()
			);

			charges.setUnloading(
					dto.getUnloading()
			);

			charges.setLocalVehicle(
					dto.getLocalVehicle()
			);

			charges.setCrossingHire(
					dto.getCrossingHire()
			);

			charges.setFreight(
					dto.getFreight()
			);

			charges.setSgst(
					dto.getSgst()
			);

			charges.setCgst(
					dto.getCgst()
			);

			charges.setIgst(
					dto.getIgst()
			);

			charges.setLoadingCharge(
					dto.getLoadingCharge()
			);

			// TOTAL CALCULATION
			double totalAmount =

					dto.getLrCharge()

							+ dto.getHamali()

							+ dto.getLoading()

							+ dto.getStationary()

							+ dto.getOtherCharges()

							+ dto.getOtherTransportCharges()

							+ dto.getMiscellaneous()

							+ dto.getCrossingAmount()

							+ dto.getPodCharges()

							+ dto.getDoorDelivery()

							+ dto.getDoorPickup()

							+ dto.getDdc()

							+ dto.getDcc()

							+ dto.getDemurrage()

							+ dto.getUnloading()

							+ dto.getLocalVehicle()

							+ dto.getCrossingHire()

							+ dto.getFreight()

							+ dto.getSgst()

							+ dto.getCgst()

							+ dto.getIgst()

							+ dto.getLoadingCharge();

			charges.setTotalAmount(totalAmount);

			charges.setModifiedDate(now);

			chargeData = bookingChargeRepo.save(charges);

			logger.info(
					"booking charges saved :: "
							+ lrNumber
			);

		} catch (Exception e) {

			logger.error(
					"unable to save booking charges :: ",
					e
			);
		}
        return chargeData;
    }

    private String normalize(String value) {
        return (value == null || value.trim().isEmpty()) ? null : value.trim();
    }

}
