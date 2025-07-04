package com.logic.logistic.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.Booking;

@Repository
public interface BookRepository extends JpaRepository<Booking, String> {
	@Query("SELECT DISTINCT b FROM Booking b WHERE (b.bookingDate BETWEEN :fromDate AND :toDate) AND b.consignStatus = :status")
	Page<Booking> findByBookingDateBetween(@Param("fromDate") LocalDateTime fromDate,
			@Param("toDate") LocalDateTime toDate, @Param("status") String status, Pageable pageable);

	@Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :from AND :to AND b.consignStatus = :status AND b.BranchCode= :branchCode ORDER BY b.bookingDate DESC")
	List<Booking> findFirstPage(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
			@Param("status") String status, Pageable pageable, @Param("branchCode") String branchCode);

	@Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :from AND :to AND b.consignStatus = :status AND b.BranchCode= :branchCode AND b.id < :lastId ORDER BY b.bookingDate DESC")
	List<Booking> findNextPage(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
			@Param("status") String status, @Param("lastId") String lastId, Pageable pageable,
			@Param("branchCode") String branchCode);

	@Query("SELECT b FROM Booking b WHERE b.loadingReciept IN :receipts")
	List<Booking> findByLoadingRecieptIn(List<String> receipts);

	@Query("SELECT b FROM Booking b WHERE b.loadingReciept= :lr")
	Booking findByLoadingReciept(String lr);

	@Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :fromDate AND :toDate AND b.BranchCode= :branchCode ORDER BY b.bookingDate DESC")
	List<Booking> findFirstPageForGlobalSearchreports(LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable,
			String branchCode);

	@Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :fromDate AND :toDate AND b.BranchCode= :branchCode AND b.id < :lastId ORDER BY b.bookingDate DESC")
	List<Booking> findNextPageForGlobalSearchreports(LocalDateTime fromDate, LocalDateTime toDate, String lastId,
			Pageable pageable, String branchCode);
}