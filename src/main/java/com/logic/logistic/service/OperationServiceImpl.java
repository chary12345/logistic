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
import com.logic.logistic.repository.RegionMasterRepository;

@Service
public class OperationServiceImpl implements OperationService {

	@Autowired
	private BookRepository bookingRepository;

	@Autowired
	private RegionMasterRepository regionMasterRepository;

	@Autowired
	private LoadingSheetRepository loadingSheetRepository;

	@Autowired
	private com.logic.logistic.repository.BookingChargeDetailsRepo bookingChargeRepo;

	private void enrichBookingsWithCharges(List<Booking> bookings) {
		if (bookings == null || bookings.isEmpty())
			return;
		List<String> lrIds = bookings.stream().map(Booking::getLoadingReciept).toList();
		List<BookingChargeDetails> charges = bookingChargeRepo.findByLoadingRecieptIn(lrIds);
		Map<String, BookingChargeDetails> chargeMap = new HashMap<>();
		for (BookingChargeDetails c : charges) {
			chargeMap.put(c.getLoadingReciept(), c);
		}
		for (Booking b : bookings) {
			BookingChargeDetails c = chargeMap.get(b.getLoadingReciept());
			if (c != null) {
				b.setLrCharge(c.getLrCharge());
				b.setHamali(c.getHamali());
				b.setStationary(c.getStationary());
				b.setOtherCharges(c.getOtherCharges());
				b.setOtherTransportCharges(c.getOtherTransportCharges());
				b.setMiscellaneous(c.getMiscellaneous());
				b.setCrossingAmount(c.getCrossingAmount());
				b.setPodCharges(c.getPodCharges());
				b.setDoorDelivery(c.getDoorDelivery());
				b.setDoorPickup(c.getDoorPickup());
				b.setDdc(c.getDdc());
				b.setDcc(c.getDcc());
				b.setDemurrage(c.getDemurrage());
				b.setUnloading(c.getUnloading());
				b.setLocalVehicle(c.getLocalVehicle());
				b.setCrossingHire(c.getCrossingHire());
				b.setTotalAmount(c.getTotalAmount());
			}
		}
	}

	@Override
	public List<Booking> getBookingsWithFilter(OperationFilter filter) {
		String status = filter.getStatus() != null ? filter.getStatus() : "BOOKED";
		List<Booking> results;

		if ("DISPATCHED".equalsIgnoreCase(status) && filter.getToBranchCode() != null) {
			// Receive page: fetch DISPATCHED LRs destined for this branch
			results = bookingRepository.findByConsignStatusAndDestinationBranchCode("DISPATCHED",
					filter.getToBranchCode());
		} else {
			if (filter.getToBranchCode() != null && !filter.getToBranchCode().trim().isEmpty()) {
				results = bookingRepository.getBookingsWithFilter(status,
						filter.getFromBranchCode(), filter.getToBranchCode());
			} else if (filter.getRegion() != null && !filter.getRegion().trim().isEmpty()) {
				List<String> destBranches;
				if (filter.getSubregion() != null && !filter.getSubregion().trim().isEmpty()) {
					destBranches = regionMasterRepository.findBranchCodesByRegionAndSubRegion(filter.getRegion(),
							filter.getSubregion());
				} else {
					destBranches = regionMasterRepository.findBranchCodesByRegion(filter.getRegion());
				}
				if (destBranches != null && !destBranches.isEmpty()) {
					results = bookingRepository.getBookingsWithFilterByDestBranches(status, filter.getFromBranchCode(),
							destBranches);
				} else {
					results = new ArrayList<>();
				}
			} else {
				results = bookingRepository.getBookingsWithFilterNoDest(status, filter.getFromBranchCode());
			}
		}

		enrichBookingsWithCharges(results);
		return results;
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
		List<Booking> bookings = bookingRepository.findByLoadingRecieptInAndConsignStatus(lrIds, "DISPATCHED");
		enrichBookingsWithCharges(bookings);

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

				List<String> lrIds = mapper.readValue(json, new TypeReference<List<String>>() {
				});

				result.addAll(lrIds); // all considered dispatched
			}

			// 🔹 NEW FORMAT → [{lrId,status}]
			else {

				List<Map<String, String>> list = mapper.readValue(json, new TypeReference<List<Map<String, String>>>() {
				});

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

		// Update Booking table first
		List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(selectedLrIds);
		for (Booking b : bookings) {
			b.setRecieveDate(java.time.LocalDateTime.now());
			b.setConsignStatus("RECEIVED");
		}
		bookingRepository.saveAll(bookings);

		// If lsId provided, also update the LS JSON
		if (lsId != null && lsId > 0) {
			LoadingSheetDTO ls = loadingSheetRepository.findById(lsId)
					.orElse(null);
			if (ls != null) {
				String json = ls.getLrIdsJson();
				ObjectMapper mapper = new ObjectMapper();
				try {
					List<Map<String, String>> updatedList = parseLrJson(json, mapper);
					for (Map<String, String> item : updatedList) {
						if (selectedLrIds.contains(item.get("lrId"))) {
							item.put("status", "RECEIVED");
						}
					}
					ls.setLrIdsJson(mapper.writeValueAsString(updatedList));
					boolean allReceived = updatedList.stream().allMatch(item -> "RECEIVED".equals(item.get("status")));
					ls.setStatus(allReceived ? "RECEIVED" : "PARTIAL");
					loadingSheetRepository.save(ls);
				} catch (Exception e) {
					/* non-fatal */ }
			}
		}
	}

	@Override
	public List<Booking> getReceivedLrsForDelivery(String destinationBranchCode, String lrNumber) {

		if (destinationBranchCode == null || destinationBranchCode.isEmpty()) {
			throw new RuntimeException("Destination branch code required");
		}

		// If a specific LR number is provided, filter to that single LR
		if (lrNumber != null && !lrNumber.trim().isEmpty()) {
			Booking booking = bookingRepository.findByLoadingReciept(lrNumber.trim());
			if (booking == null || !"RECEIVED".equalsIgnoreCase(booking.getConsignStatus())
					|| !destinationBranchCode.equalsIgnoreCase(booking.getDestinationBranchCode())) {
				return new ArrayList<>();
			}
			List<Booking> list = List.of(booking);
			enrichBookingsWithCharges(list);
			return list;
		}

		List<Booking> bookings = bookingRepository.findByConsignStatusAndDestinationBranchCode("RECEIVED",
				destinationBranchCode);
		enrichBookingsWithCharges(bookings);
		return bookings;
	}

	@Override
	public void deliverSelectedLrs(List<String> lrIds) {

		// 🔹 Fetch bookings
		List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(lrIds);

		if (bookings == null || bookings.isEmpty()) {
			throw new RuntimeException("No LRs found for delivery");
		}

		// 🔹 Update only RECEIVED ones
		for (Booking booking : bookings) {

			if ("RECEIVED".equalsIgnoreCase(booking.getConsignStatus())) {

				booking.setConsignStatus("DELIVERED");
				booking.setDeliveryDate(LocalDateTime.now());

			} else {
				throw new RuntimeException("LR " + booking.getLoadingReciept() + " is not in RECEIVED state");
			}
		}

		// 🔹 Save all
		bookingRepository.saveAll(bookings);
	}

	public static LocalDateTime toDateTime(String input) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
		return LocalDateTime.parse(input, formatter);
	}

	@Override
	public List<LoadingSheetDTO> getLoadingSheetList(String companyCode, String destinationBranch) {
		return loadingSheetRepository.findByDestinationBranchAndStatusNotOrNull(destinationBranch, "COMPLETED");
	}

	@Override
	public List<DispatchedResponseDTO> getDispatchedListByBranch(String destinationBranch, String fromBranch) {
		if (destinationBranch == null || destinationBranch.isBlank()) {
			throw new RuntimeException("destinationBranch is required");
		}

		List<LoadingSheetDTO> lsList = loadingSheetRepository
				.findByDestinationBranchAndStatusNotOrNull(destinationBranch, fromBranch);

		List<DispatchedResponseDTO> result = new ArrayList<>();

		for (LoadingSheetDTO ls : lsList) {
			DispatchedResponseDTO dto = new DispatchedResponseDTO();
			dto.setLoadingSheet(ls);

			List<String> lrIds = getDispatchedLrIds(ls.getLrIdsJson());
			if (lrIds == null || lrIds.isEmpty()) {
				dto.setBookings(new ArrayList<>());
			} else {
				List<Booking> bookings = bookingRepository
						.findByLoadingRecieptInAndConsignStatus(lrIds, "DISPATCHED");
				enrichBookingsWithCharges(bookings);
				dto.setBookings(bookings);
			}
			dto.setStatus("SUCCESS");
			result.add(dto);
		}

		// Sort newest LS first
		result.sort((a, b) -> {
			Long aId = a.getLoadingSheet() != null ? a.getLoadingSheet().getLoadingSheetNumber() : 0L;
			Long bId = b.getLoadingSheet() != null ? b.getLoadingSheet().getLoadingSheetNumber() : 0L;
			return Long.compare(bId, aId);
		});

		return result;
	}

	@Override
	@Transactional
	public void cancelLS(Long lsId) {
		LoadingSheetDTO ls = loadingSheetRepository.findById(lsId)
				.orElseThrow(() -> new RuntimeException("LS not found: " + lsId));

		// Collect all LR IDs from JSON
		List<String> allLrIds = getAllLrIds(ls.getLrIdsJson());

		// Revert LR statuses to BOOKED and clear dispatch date
		if (!allLrIds.isEmpty()) {
			List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(allLrIds);
			for (Booking b : bookings) {
				b.setConsignStatus("BOOKED");
				b.setDispatchDate(null);
			}
			bookingRepository.saveAll(bookings);
		}

		// Soft-delete: mark LS as CANCELLED
		ls.setStatus("CANCELLED");
		loadingSheetRepository.save(ls);
	}

	@Override
	@Transactional
	public void editLrInLS(Long lsId, String lrId, String unloadingBranch, String vehicleNumber) {
		// Verify LS exists
		LoadingSheetDTO ls = loadingSheetRepository.findById(lsId)
				.orElseThrow(() -> new RuntimeException("LS not found: " + lsId));

		if (vehicleNumber != null && !vehicleNumber.isBlank()) {
			ls.setVehicleNumber(vehicleNumber);
			loadingSheetRepository.save(ls);
		}

		// Update booking fields
		Booking booking = bookingRepository.findByLoadingReciept(lrId);
		if (booking == null)
			throw new RuntimeException("LR not found: " + lrId);

		if (unloadingBranch != null && !unloadingBranch.isBlank()) {
			booking.setDestinationBranchCode(unloadingBranch);
		}
		bookingRepository.save(booking);
	}

	@Override
	@Transactional
	public void removeLrFromLS(Long lsId, String lrId) {
		LoadingSheetDTO ls = loadingSheetRepository.findById(lsId)
				.orElseThrow(() -> new RuntimeException("LS not found: " + lsId));

		ObjectMapper mapper = new ObjectMapper();
		try {
			List<Map<String, String>> list = parseLrJson(ls.getLrIdsJson(), mapper);
			list.removeIf(item -> lrId.equals(item.get("lrId")));
			ls.setLrIdsJson(mapper.writeValueAsString(list));
		} catch (Exception e) {
			throw new RuntimeException("Failed to update LS JSON");
		}
		loadingSheetRepository.save(ls);

		// Revert LR status to BOOKED
		Booking booking = bookingRepository.findByLoadingReciept(lrId);
		if (booking != null) {
			booking.setConsignStatus("BOOKED");
			booking.setDispatchDate(null);
			bookingRepository.save(booking);
		}
	}

	@Override
	@Transactional
	public void addLrToLS(Long lsId, String lrId) {
		LoadingSheetDTO ls = loadingSheetRepository.findById(lsId)
				.orElseThrow(() -> new RuntimeException("LS not found: " + lsId));

		Booking booking = bookingRepository.findByLoadingReciept(lrId);
		if (booking == null)
			throw new RuntimeException("LR not found: " + lrId);
		if (!"BOOKED".equalsIgnoreCase(booking.getConsignStatus())) {
			throw new RuntimeException("LR is not in BOOKED state");
		}

		ObjectMapper mapper = new ObjectMapper();
		try {
			List<Map<String, String>> list = parseLrJson(ls.getLrIdsJson(), mapper);
			// Check duplicate
			boolean exists = list.stream().anyMatch(item -> lrId.equals(item.get("lrId")));
			if (!exists) {
				Map<String, String> entry = new HashMap<>();
				entry.put("lrId", lrId);
				entry.put("status", "DISPATCHED");
				list.add(entry);
			}
			ls.setLrIdsJson(mapper.writeValueAsString(list));
			if ("CANCELLED".equalsIgnoreCase(ls.getStatus())) {
				ls.setStatus("DISPATCHED");
			}
		} catch (Exception e) {
			throw new RuntimeException("Failed to update LS JSON");
		}
		loadingSheetRepository.save(ls);

		// Mark LR as DISPATCHED
		booking.setConsignStatus("DISPATCHED");
		booking.setDispatchDate(java.time.LocalDateTime.now());
		bookingRepository.save(booking);
	}

	@Override
	public DispatchedResponseDTO searchLSByNumber(Long lsNumber) {
		LoadingSheetDTO ls = loadingSheetRepository.findById(lsNumber)
				.orElseThrow(() -> new RuntimeException("LS not found: " + lsNumber));

		DispatchedResponseDTO dto = new DispatchedResponseDTO();
		dto.setLoadingSheet(ls);

		// Include all LRs regardless of status for Edit tab
		List<String> allLrIds = getAllLrIds(ls.getLrIdsJson());
		if (!allLrIds.isEmpty()) {
			List<Booking> bookings = bookingRepository.findByLoadingRecieptIn(allLrIds);
			enrichBookingsWithCharges(bookings);
			dto.setBookings(bookings);
		} else {
			dto.setBookings(new ArrayList<>());
		}
		dto.setStatus("SUCCESS");
		return dto;
	}

	/**
	 * Extract all LR IDs from JSON (both old string[] and new {lrId,status}[]
	 * formats)
	 */
	private List<String> getAllLrIds(String json) {
		List<String> result = new ArrayList<>();
		if (json == null || json.isBlank())
			return result;
		ObjectMapper mapper = new ObjectMapper();
		try {
			if (!json.contains("lrId")) {
				result.addAll(mapper.readValue(json, new TypeReference<List<String>>() {
				}));
			} else {
				List<Map<String, String>> list = mapper.readValue(json, new TypeReference<List<Map<String, String>>>() {
				});
				for (Map<String, String> item : list)
					result.add(item.get("lrId"));
			}
		} catch (Exception e) {
			throw new RuntimeException("Error parsing LR JSON");
		}
		return result;
	}

	/** Parse lrIdsJson into [{lrId, status}] format, normalising old format */
	private List<Map<String, String>> parseLrJson(String json, ObjectMapper mapper) throws Exception {
		List<Map<String, String>> result = new ArrayList<>();
		if (json == null || json.isBlank())
			return result;
		if (!json.contains("lrId")) {
			List<String> ids = mapper.readValue(json, new TypeReference<List<String>>() {
			});
			for (String id : ids) {
				Map<String, String> m = new HashMap<>();
				m.put("lrId", id);
				m.put("status", "DISPATCHED");
				result.add(m);
			}
		} else {
			result.addAll(mapper.readValue(json, new TypeReference<List<Map<String, String>>>() {
			}));
		}
		return result;
	}
}
