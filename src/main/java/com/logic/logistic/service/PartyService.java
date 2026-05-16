package com.logic.logistic.service;

import com.logic.logistic.model.PartyRequestDTO;
import com.logic.logistic.model.PartyResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PartyService {
     PartyResponseDTO saveParty(PartyRequestDTO request);

    List<PartyResponseDTO> getPartiesByCompany(String companyCode);

    List<PartyResponseDTO> searchParties(String companyCode, String partyName);
}
