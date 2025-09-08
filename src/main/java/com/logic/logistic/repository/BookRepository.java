package com.logic.logistic.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.Booking;

import jakarta.transaction.Transactional;

@Repository
@Transactional
public interface BookRepository extends JpaRepository<Booking, String> {
	@Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :fromDate AND :toDate or b.consignStatus = :status AND b.BranchCode= :branchCode ORDER BY b.bookingDate DESC")
	List<Booking> findByBookingDateBetween(@Param("fromDate") LocalDateTime fromDate,
			@Param("toDate") LocalDateTime toDate, @Param("status") String status,
			@Param("branchCode") String branchCode);

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

	@Query(value = " SELECT DISTINCT b.employee_name FROM booking b JOIN branch_data bd ON b.branch_code = bd.branch_code WHERE bd.company_code = :companyCode AND b.branch_code = :branchCode AND b.employee_name IS NOT NULL", nativeQuery = true)
	List<String> findEmployeeNamesByCompanyAndBranch(@Param("companyCode") String companyCode,
			@Param("branchCode") String branchCode);

	@Query(value = "SELECT b.* FROM booking b JOIN branch_data bd ON b.branch_code = bd.branch_code JOIN address_dto a ON b.branch_code = a.branch_code WHERE (b.booking_date BETWEEN :fromDate AND :toDate) AND (b.consign_status = 'BOOKED') AND (:region IS NULL OR a.state = :region) or (:subregion IS NULL OR a.city = :subregion) or (:branchCode IS NULL OR bd.branch_name = :branchCode) or (:employeeName IS NULL OR b.employee_name = :employeeName) ", nativeQuery = true)
	List<Booking> findBookingsByFilter(@Param("fromDate") String fromDate, @Param("toDate") String toDate,
			@Param("status") String status, @Param("region") String region, @Param("subregion") String subregion,
			@Param("branchCode") String branchCode, @Param("employeeName") String employeeName);

	@Query("SELECT DISTINCT (TRIM(r.id.branchCode)) " + "FROM RegionMasterDto r "
			+ "WHERE (:state IS NULL OR (TRIM(r.id.region)) = (TRIM(:state))) "
			+ "AND (:city IS NULL OR (TRIM(r.id.subRegion)) = (TRIM(:city))) "
			+ "AND (:branchCode IS NULL OR (TRIM(r.id.branchCode)) = (TRIM(:branchCode)))")
	List<String> getlistofBranchcodes(@Param("city") String city, @Param("state") String state,
			@Param("branchCode") String branchCode);

	@Query("SELECT b FROM Booking b " + "WHERE b.bookingDate BETWEEN :fromDate AND :toDate "
			+ "AND b.BranchCode IN (:branchCodes) " + "AND (:status IS NULL OR b.consignStatus = :status) "
			+ "AND (:lastId IS NULL OR b.loadingReciept < :lastId) " + "ORDER BY b.bookingDate DESC")
	List<Booking> searchBookings(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate,
			@Param("status") String status, @Param("lastId") String lastId,
			@Param("branchCodes") List<String> branchCodes, Pageable pageable);

	@Query("SELECT b FROM Booking b " + "WHERE b.BranchCode = :branchCode "
			+ "AND b.bookingDate BETWEEN :fromDate AND :toDate "
			+ "AND (:paymentMode IS NULL OR b.billType = :paymentMode)")
	List<Booking> findStatements(@Param("branchCode") String branchCode, @Param("fromDate") LocalDateTime fromDate,
			@Param("toDate") LocalDateTime toDate, @Param("paymentMode") String paymentMode);
}