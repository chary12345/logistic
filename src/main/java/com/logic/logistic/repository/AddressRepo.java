package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.AddressDto;


@Repository
public interface AddressRepo extends JpaRepository<AddressDto, Long>{

	AddressDto findByBranchCode(String branchCode);

}
