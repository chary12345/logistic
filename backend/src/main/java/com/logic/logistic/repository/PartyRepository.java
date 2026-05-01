package com.logic.logistic.repository;

import com.logic.logistic.dto.PartyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartyRepository extends JpaRepository<PartyEntity, Long> {

    boolean existsByCompanyCodeAndPartyName(String companyCode, String partyName);
    List<PartyEntity> findByCompanyCode(String companyCode);

    @Query("SELECT p FROM PartyEntity p WHERE p.companyCode = :companyCode " +
            "AND LOWER(p.partyName) LIKE LOWER(CONCAT('%', :partyName, '%'))")
    List<PartyEntity> searchParties(String companyCode, String partyName);
}