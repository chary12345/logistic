package com.logic.logistic.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.logic.logistic.dto.*;
import com.logic.logistic.repository.LoadingSheetRepository;
import com.logic.logistic.util.JsonUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.model.OperationFilter;
import com.logic.logistic.repository.BookRepository;

@Service
public class OperationServiceImpl implements OperationService {

	@Autowired
	private BookRepository bookingRepository;

	@Autowired
	private LoadingSheetRepository loadingSheetRepository;

	@Override
	public List<Booking> getBookingsWithFilter(OperationFilter filter) {
		LocalDateTime from = null;
		LocalDateTime to = null ;
		if(filter.getFromDate()!=null)
			from = toDateTime(filter.getFromDate());
		if(filter.getToDate()!=null)
			to = toDateTime(filter.getToDate());
		List<Booking> findByBookingDateBetween = bookingRepository.findByBookingDateBetween(from, to, "BOOKED",filter.getBranchCode());

		return findByBookingDateBetween;
	}

	@Override
	public DispatchedResponseDTO disaptchedListByLsORVehicleNumber(Long lsId, String vehicleNo) {

		if (lsId == null) {
			throw new RuntimeException("Provide LS ID");
		}

		DispatchedResponseDTO response = new DispatchedResponseDTO();

		LoadingSheetDTO ls = loadingSheetRepository.findById(lsId)
				.orElseThrow(() -> new RuntimeException("LS not found"));

		response.setLoadingSheet(ls);

		// 🔥 Get only dispatched LR IDs (handles both JSON formats)
		List<String> lrIds = getDispatchedLrIds(ls.getLrIdsJson());

		System.out.println("Filtered LR IDs: " + lrIds); // debug

		if (lrIds == null || lrIds.isEmpty()) {
			response.setBookings(new ArrayList<>());
			response.setStatus("SUCCESS");
			return response;
		}

		// 🔥 Fetch only DISPATCHED bookings
		List<Booking> bookings = bookingRepository
				.findByLoadingRecieptInAndConsignStatus(lrIds, "DISPATCHED");

		response.setBookings(bookings);
		response.setStatus("SUCCESS");

		return response;
	}
	private List<String> getDispatchedLrIds(String json) {

		List<String> result = new ArrayList<>();

		if (json == null || json.isEmpty()) {
			return result;
		}

		ObjectMapper mapper = new ObjectMapper();

		try {

			// 🔹 OLD FORMAT → ["LR1","LR2"]
			if (!json.contains("lrId")) {

				List<String> lrIds = mapper.readValue(
						json, new TypeReference<List<String>>() {}
				);

				result.addAll(lrIds); // all considered dispatched
			}

			// 🔹 NEW FORMAT → [{lrId,status}]
			else {

				List<Map<String, String>> list = mapper.readValue(
						json, new TypeReference<List<Map<String, String>>>() {}
				);

				for (Map<String, String> item : list) {

					String lrId = item.get("lrId");
					String status = item.get("status");

					// 👉 Only NOT RECEIVED
					if (!"RECEIVED".equalsIgnoreCase(status)) {
						result.add(lrId);
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("Error parsing LR JSON");
		}

		return result;
	}
	@Override
	public void receiveSelectedLrs(ReceiveRequest request) {

		Long lsId = request.getLsId();
		List<String> selectedLrIds = request.getLrIds();

		LoadingSheetDTO ls = loadingSheetRepository.findById(lsId)
				.orElseThrow(() -> new RuntimeException("LS not found"));

		String json = ls.getLrIdsJson();

		ObjectMapper mapper = new ObjectMapper();
		List<Map<String, String>> updatedList = new ArrayList<>();

		try {

			// 🔥 Detect format
			if (json.trim().startsWith("[")) {

				// CASE 1: Old format ["LR1","LR2"]
				if (json.contains("\"") && !json.contains("lrId")) {

					List<String> lrIds = mapper.readValue(json, new TypeReference<List<String>>() {});

					for (String lrId : lrIds) {
						Map<String, String> obj = new HashMap<>();
						obj.put("lrId", lrId);

						if (selectedLrIds.contains(lrId)) {
							obj.put("status", "RECEIVED");
						} else {
							obj.put("status", "PENDING");
						}

						updatedList.add(obj);
					}

				} else {
					// CASE 2: Already object format
					List<Map<String, String>> existingList =
							mapper.readValue(json, new TypeReference<List<Map<String, String>>>() {});

					for (Map<String, String> item : existingList) {

						String lrId = item.get("lrId");
						String currentStatus = item.get("status");

						Map<String, String> obj = new HashMap<>();
						obj.put("lrId", lrId);

						// 🔥 IMPORTANT: Don't revert RECEIVED
						if ("RECEIVED".equalsIgnoreCase(currentStatus)) {
							obj.put("status", "RECEIVED");
						} else if (selectedLrIds.contains(lrId)) {
							obj.put("status", "RECEIVED");
						} else {
							obj.put("status", "PENDING");
						}

						updatedList.add(obj);
					}
				}
			}

		} catch (Exception e) {
			throw new RuntimeException("Error parsing LR JSON");
		}

		// 🔹 Update Booking Table
		List<Booking> bookings = bookingRepository
				.findByLoadingRecieptIn(selectedLrIds);

		for (Booking b : bookings) {
			b.setRecieveDate(LocalDateTime.now());
			b.setConsignStatus("RECEIVED");
		}

		bookingRepository.saveAll(bookings);

		// 🔹 Save JSON
		try {
			ls.setLrIdsJson(mapper.writeValueAsString(updatedList));
		} catch (Exception e) {
			throw new RuntimeException("JSON conversion failed");
		}

		// 🔹 Update LS Status
		boolean allReceived = updatedList.stream()
				.allMatch(item -> "RECEIVED".equals(item.get("status")));

		if (allReceived) {
			ls.setStatus("RECEIVED");
		} else {
			ls.setStatus("PARTIAL");
		}

		loadingSheetRepository.save(ls);
	}

	@Override
	public List<Booking> getReceivedLrsForDelivery(String destinationBranchCode, String lrNumber) {

		if (destinationBranchCode == null || destinationBranchCode.isEmpty()) {
			throw new RuntimeException("Destination branch code required");
		}

		// If a specific LR number is provided, filter to that single LR
		if (lrNumber != null && !lrNumber.trim().isEmpty()) {
			Booking booking = bookingRepository.findByLoadingReciept(lrNumber.trim());
			if (booking == null
					|| !"RECEIVED".equalsIgnoreCase(booking.getConsignStatus())
					|| !destinationBranchCode.equalsIgnoreCase(booking.getDestinationBranchCode())) {
				return new ArrayList<>();
			}
			return List.of(booking);
		}

		return bookingRepository.findByConsignStatusAndDestinationBranchCode(
				"RECEIVED", destinationBranchCode
		);
	}

	@Override
	public void deliverSelectedLrs(List<String> lrIds) {

		// 🔹 Fetch bookings
		List<Booking> bookings = bookingRepository
				.findByLoadingRecieptIn(lrIds);

		if (bookings == null || bookings.isEmpty()) {
			throw new RuntimeException("No LRs found for delivery");
		}

		// 🔹 Update only RECEIVED ones
		for (Booking booking : bookings) {

			if ("RECEIVED".equalsIgnoreCase(booking.getConsignStatus())) {

				booking.setConsignStatus("DELIVERED");
				booking.setDeliveryDate(LocalDateTime.now());

			} else {
				throw new RuntimeException(
						"LR " + booking.getLoadingReciept() + " is not in RECEIVED state"
				);
			}
		}

		// 🔹 Save all
		bookingRepository.saveAll(bookings);
	}

	public static LocalDateTime toDateTime(String input) {
	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
	return LocalDateTime.parse(input, formatter);
}
}
