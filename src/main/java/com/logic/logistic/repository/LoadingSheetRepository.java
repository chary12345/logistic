package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.LoadingSheetDTO;

@Repository
public interface LoadingSheetRepository extends JpaRepository<LoadingSheetDTO, Long> {
}