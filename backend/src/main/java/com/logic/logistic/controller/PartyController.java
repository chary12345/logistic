package com.logic.logistic.controller;

import com.logic.logistic.model.PartyRequestDTO;
import com.logic.logistic.model.PartyResponseDTO;
import com.logic.logistic.service.PartyService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/party")
public class PartyController {

    @Autowired
    private PartyService partyService;

    @PostMapping("/create")
    public ResponseEntity<PartyResponseDTO> createParty(
            @Valid @RequestBody PartyRequestDTO request) {

        return ResponseEntity.ok(
                partyService.saveParty(request)
        );
    }

    @GetMapping("/getPartiesByCompanyCode")
    public ResponseEntity<List<PartyResponseDTO>> getParties(
            @RequestParam String companyCode) {

        return ResponseEntity.ok(
                partyService.getPartiesByCompany(companyCode)
        );
    }

    @GetMapping("/searchPartiesBypartyName")
    public ResponseEntity<List<PartyResponseDTO>> searchParties(
            @RequestParam String companyCode,
            @RequestParam(required = false) String partyName) {

        return ResponseEntity.ok(
                partyService.searchParties(companyCode, partyName)
        );
    }
}