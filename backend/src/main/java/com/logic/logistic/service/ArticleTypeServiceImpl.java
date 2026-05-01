package com.logic.logistic.service;

import com.logic.logistic.dto.ArticleType;
import com.logic.logistic.model.ArticleTypeRequest;
import com.logic.logistic.model.ArticleTypeResponse;
import com.logic.logistic.repository.ArticleTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArticleTypeServiceImpl implements ArticleTypeService{
    @Autowired
    private ArticleTypeRepository repo;

    @Override
    public ArticleTypeResponse create(ArticleTypeRequest request) {

        String type = request.getArticleType().trim().toUpperCase();
        String companyCode = request.getCompanyCode();

        if (companyCode == null || companyCode.isBlank()) {
            throw new RuntimeException("companyCode is mandatory");
        }

        if (type.isEmpty()) {
            throw new RuntimeException("articleType is required");
        }

        boolean exists = repo.existsByCompanyCodeAndArticleType(companyCode, type);

        if (exists) {
            throw new RuntimeException("Article type already exists");
        }

        ArticleType entity = new ArticleType();
        entity.setCompanyCode(companyCode);
        entity.setArticleType(type);

        repo.save(entity);

        ArticleTypeResponse res = new ArticleTypeResponse();
        res.setId(entity.getId());
        res.setCompanyCode(companyCode);
        res.setArticleType(type);
        res.setMessage("Article Type Created Successfully");

        return res;
    }

    @Override
    public List<String> getByCompany(String companyCode) {

        return repo.findByCompanyCodeOrderByArticleTypeAsc(companyCode)
                .stream()
                .map(ArticleType::getArticleType)
                .toList();
    }
}
