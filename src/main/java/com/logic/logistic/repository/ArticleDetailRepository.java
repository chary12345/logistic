package com.logic.logistic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.ArticleDetailDto;

import jakarta.transaction.Transactional;

@Repository
@Transactional
public interface ArticleDetailRepository extends JpaRepository<ArticleDetailDto, Long> {
	// Fetch all articles for a given LR
	List<ArticleDetailDto> findByLoadingReciept(String loadingReciept);

	//delete all articles for an LR (for edit-case overwrite)
	void deleteByLoadingReciept(String loadingReciept);
}
