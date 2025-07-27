package com.logic.logistic.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.RegionSearchDTO;
import com.logic.logistic.model.BookingDTO;
import com.logic.logistic.model.BookingPageResponse;
import com.logic.logistic.model.DispatchRequest;
import com.logic.logistic.service.BookingService;
import com.logic.logistic.service.RegionServiceImpl;

@RestController
@RequestMapping("/api/bookings")

public class BookingController {

	@Autowired
	private BookingService bookingService;
	
	@Autowired
	private RegionServiceImpl<?> regserviceImpl;

	private static final long serialVersionUID = 1L;

	private static org.apache.logging.log4j.Logger logger = LogManager.getLogger();

	@PostMapping("/bookLoad")
	public ResponseEntity<Booking> createBooking(@RequestBody BookingDTO dto) {
		Booking saved = bookingService.saveBooking(dto);
		return ResponseEntity.ok(saved);
	}

	 @PutMapping("/bookLoad/{lr}")
	    public ResponseEntity<?> updateBooking(@PathVariable String lr, @RequestBody BookingDTO dto) {
	        try {
	            Booking bookingUpdated = bookingService.updateBooking(lr, dto);
	            return ResponseEntity.ok(bookingUpdated);
	        } catch (Exception e) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Update failed: " + e.getMessage());
	        }
	    }
		/*
		 * // @GetMapping("/report") public ResponseEntity<?> getBookingReport(
		 * 
		 * @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime
		 * fromDate,
		 * 
		 * @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime
		 * toDate,
		 * 
		 * @RequestParam(required = false) String status) { return
		 * ResponseEntity.ok(bookingService.getBookingReportsBetweenDates(fromDate,
		 * toDate, status)); }
		 */

	@GetMapping("/report")
	public ResponseEntity<BookingPageResponse> getReport(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
			@RequestParam String status, @RequestParam(required = false) String lastId,
			@RequestParam(required = false) String branchCode) {
		BookingPageResponse response = bookingService.getReports(fromDate, toDate, status, lastId, branchCode);
		return ResponseEntity.ok(response);
	}

	/*
	 * @GetMapping("/todayReports") public ResponseEntity<?> toDayBookingRepoprts(
	 * 
	 * @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime
	 * fromDate,
	 * 
	 * @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime
	 * toDate, String status) { return
	 * ResponseEntity.ok(bookingService.getBookingReportsBetweenDates(fromDate,
	 * toDate, status)); }
	 */
	
	@PostMapping("/dispatchLoad")
	public ResponseEntity<List<Booking>> dispatchLoad(@RequestBody DispatchRequest request) {
	    List<Booking> dispatched = bookingService.dispatchLoad(request);
	    return ResponseEntity.ok(dispatched);
	}

	@GetMapping("/searchBylr")
	public ResponseEntity<?> searchByLR(@RequestParam String lr) {
		try {
			BookingDTO dto = bookingService.findByLoadingReciept(lr);

			if (dto != null) {

				return ResponseEntity.ok(dto);
			} else {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No record found");
			}
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
		}
	}

	@GetMapping("/get-Global-Search-Repoprts")
	public ResponseEntity<BookingPageResponse> getGlobalSearchreports(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
			@RequestParam String status, @RequestParam(required = false) String lastId,
			@RequestParam(required = false) String branchCode) {
		BookingPageResponse response = bookingService.getGlobalSearchreports(fromDate, toDate, lastId, branchCode);
		return ResponseEntity.ok(response);
	}
	
	@GetMapping(value = "/region-search", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<List<RegionSearchDTO>> getsearchResults(
			@RequestParam String fromDate,
		    @RequestParam String toDate,
		    @RequestParam(required = false) String region,
		    @RequestParam(required = false) String subRegion,
		    @RequestParam(required = false) String branch){
		logger.info("Searching region report: from={}, to={}, region={}, subRegion={}, branch={}",
                fromDate, toDate, region, subRegion, branch);
		
		 try {
		        LocalDateTime from = LocalDate.parse(fromDate).atStartOfDay();
		        LocalDateTime to = LocalDate.parse(toDate).atTime(23, 59, 59);

		        List<RegionSearchDTO> result = regserviceImpl.getGlobalSearchResults(from, to, region, subRegion, branch);

		        logger.info("Region Search Results Found: {}", result.size());
		        return ResponseEntity.ok(result);

		    } catch (Exception e) {
		        logger.error("Error during region search", e);
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		    }
		
//		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//	    LocalDateTime fromDateTime = LocalDate.parse(fromDate, formatter).atStartOfDay();
//	    LocalDateTime toDateTime = LocalDate.parse(toDate, formatter).atTime(LocalTime.MAX);

//	    List<RegionSearchDTO> result = regserviceImpl.getGlobalSearchResults(from, to, region, subRegion, branch);
//	    logger.info("Search result count: {}", result.size());
//    return ResponseEntity.ok(result);
		
	}
}