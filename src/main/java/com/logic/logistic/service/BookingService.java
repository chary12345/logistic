package com.logic.logistic.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.BookingReceiptSequence;
import com.logic.logistic.model.BookingDTO;
import com.logic.logistic.repository.BookRepository;
import com.logic.logistic.repository.BookingReceiptSequenceRepository;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

	@Autowired
	private BookingReceiptSequenceRepository sequenceRepo;

	@Autowired
	private BookRepository bookingRepo;

	@Transactional
	public Booking saveBooking(BookingDTO dto) {
		String key = dto.getCompanyCode() + dto.getBranchCode();
		Booking save =null;
		try {
			BookingReceiptSequence sequence = sequenceRepo.findById(key).orElseGet(() -> {
				BookingReceiptSequence s = new BookingReceiptSequence();
				s.setKeyCode(key);
				s.setLastNumber(0);
				return s;
			});

			int newSerial = sequence.getLastNumber() + 1;
			sequence.setLastNumber(newSerial);
			sequenceRepo.save(sequence);

			String loadingReceipt = key + String.format("%03d", newSerial);

			Booking booking = new Booking();
			booking.setLoadingReciept(loadingReceipt);
			booking.setConsignorName(dto.getConsignorName());
			booking.setConsignorMobile(dto.getConsignorMobile());
			booking.setConsignorAddress(dto.getConsignorAddress());

			booking.setConsigneeName(dto.getConsigneeName());
			booking.setConsigneeMobile(dto.getConsigneeMobile());
			booking.setConsigneeAddress(dto.getConsigneeAddress());

			booking.setArticleType(dto.getArticleType());
			booking.setArticleWeight(dto.getArticleWeight());
			booking.setFreight(dto.getFreight());
			booking.setSgst(dto.getSgst());
			booking.setCgst(dto.getCgst());
			booking.setIgst(dto.getIgst());
			 booking.setBookingDate(LocalDateTime.now());
			 booking.setConsignStatus("BOOKED");
			save= bookingRepo.save(booking);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return save;
	}
}
