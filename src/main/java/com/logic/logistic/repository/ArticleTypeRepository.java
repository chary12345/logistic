package com.logic.logistic.repository;

import com.logic.logistic.dto.ArticleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleTypeRepository extends JpaRepository<ArticleType, Long> {

    boolean existsByCompanyCodeAndArticleType(String companyCode, String articleType);

    List<ArticleType> findByCompanyCodeOrderByArticleTypeAsc(String companyCode);
}