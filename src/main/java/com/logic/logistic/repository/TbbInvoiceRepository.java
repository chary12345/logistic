package com.logic.logistic.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.logic.logistic.dto.TbbInvoiceDTO;

public interface TbbInvoiceRepository extends JpaRepository<TbbInvoiceDTO, Long> {

    @Query("SELECT t FROM TbbInvoiceDTO t WHERE t.fromBranch = :branch AND t.createdAt BETWEEN :fromDate AND :toDate ORDER BY t.createdAt DESC")
    List<TbbInvoiceDTO> findByBranchAndDateRange(
        @Param("branch") String branch, 
        @Param("fromDate") LocalDateTime fromDate, 
        @Param("toDate") LocalDateTime toDate
    );

    @Query("SELECT COUNT(t) FROM TbbInvoiceDTO t WHERE t.fromBranch = :branch")
    long countByFromBranch(@Param("branch") String branch);

    java.util.Optional<TbbInvoiceDTO> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT t FROM TbbInvoiceDTO t WHERE t.fromBranch = :branch ORDER BY t.createdAt DESC")
    List<TbbInvoiceDTO> findByFromBranchOrderByCreatedAtDesc(@Param("branch") String branch);

    /** All branches – date range only (SuperAdmin) */
    @Query("SELECT t FROM TbbInvoiceDTO t WHERE t.createdAt BETWEEN :fromDate AND :toDate ORDER BY t.createdAt DESC")
    List<TbbInvoiceDTO> findAllByDateRange(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );

    @Query("SELECT t FROM TbbInvoiceDTO t WHERE t.fromBranch IN :branches AND t.createdAt BETWEEN :fromDate AND :toDate ORDER BY t.createdAt DESC")
    List<TbbInvoiceDTO> findByFromBranchInAndDateRange(
        @Param("branches") List<String> branches,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );
}
