package com.logic.logistic.controller;

import com.logic.logistic.dto.UserChargeConfigDTO;
import com.logic.logistic.model.UserChargeConfigModel;
import com.logic.logistic.model.UserChargeConfigResponse;
import com.logic.logistic.service.UserChargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/charges")
public class UserChargeController {

    @Autowired
    private UserChargeService service;

    // SAVE
    @PostMapping("/create-company-charges-list")
    public ResponseEntity<String> save(@RequestBody UserChargeConfigModel dto) {
        service.save(dto);
        return ResponseEntity.ok("Saved successfully");
    }

    // GET
    @GetMapping("/getCompanyChargesList/{companyCode}")
    public ResponseEntity<UserChargeConfigResponse> get(
            @PathVariable String companyCode) {

        return ResponseEntity.ok(service.get(companyCode));
    }
}