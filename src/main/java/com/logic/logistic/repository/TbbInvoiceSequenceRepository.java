package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.TbbInvoiceSequence;

@Repository
public interface TbbInvoiceSequenceRepository extends JpaRepository<TbbInvoiceSequence, String> {
}
