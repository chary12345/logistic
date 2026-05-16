package com.logic.logistic.service;

import com.logic.logistic.model.ArticleTypeRequest;
import com.logic.logistic.model.ArticleTypeResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ArticleTypeService {
    ArticleTypeResponse create(ArticleTypeRequest request);

    List<String> getByCompany(String companyCode);
}
