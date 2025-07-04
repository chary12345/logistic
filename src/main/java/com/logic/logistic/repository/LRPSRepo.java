package com.logic.logistic.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.LRPS;
import com.logic.logistic.dto.LRPSId;



@Repository
public interface LRPSRepo extends JpaRepository<LRPS, LRPSId> {
	
	@Query("SELECT l FROM LRPS l WHERE l.paidDate BETWEEN :from AND :to "
	         + "AND (:region IS NULL OR l.region = :region) "
	         + "AND (:subRegion IS NULL OR l.subRegion = :subRegion) "
	         + "AND (:branch IS NULL OR l.branch = :branch)")
	    List<LRPS> search(LocalDate from, LocalDate to, String region, String subRegion, String branch);


}