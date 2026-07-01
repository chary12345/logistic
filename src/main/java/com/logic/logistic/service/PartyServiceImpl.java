package com.logic.logistic.service;

import com.logic.logistic.dto.PartyEntity;
import com.logic.logistic.model.PartyRequestDTO;
import com.logic.logistic.model.PartyResponseDTO;
import com.logic.logistic.repository.PartyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PartyServiceImpl implements  PartyService{

    @Autowired
    private PartyRepository partyRepository;

    @Override
    public PartyResponseDTO saveParty(PartyRequestDTO request) {

        if (partyRepository.existsByCompanyCodeAndPartyName(
                request.getCompanyCode(),
                request.getPartyName())) {

            throw new RuntimeException("Party already exists for this company");
        }

        PartyEntity party = new PartyEntity();

        party.setCompanyCode(request.getCompanyCode());
        party.setBranchCode(request.getBranchCode());
        party.setPartyName(request.getPartyName());
        party.setDisplayName(request.getDisplayName());
        party.setPartyCode(request.getPartyCode());
        party.setPartyType(request.getPartyType());
        party.setTbb(true);

        party.setContactPerson(request.getContactPerson());
        party.setMobileNumber1(request.getMobileNumber1());
        party.setMobileNumber2(request.getMobileNumber2());
        party.setPhoneNumber1(request.getPhoneNumber1());
        party.setPhoneNumber2(request.getPhoneNumber2());

        party.setAddress(request.getAddress());
        party.setCity(request.getCity());
        party.setState(request.getState());
        party.setCountry(request.getCountry());
        party.setPincode(request.getPincode());

        party.setGstNumber(request.getGstNumber());
        party.setPanNumber(request.getPanNumber());

        party.setBlackListed(request.getBlackListed());
        party.setPodRequired(request.getPodRequired());
        party.setGstPaidByTransporter(request.getGstPaidByTransporter());

        party.setIssueDate(request.getIssueDate());
        party.setCreatedAt(LocalDateTime.now());

        PartyEntity saved = partyRepository.save(party);

        PartyResponseDTO response = new PartyResponseDTO();
        response.setId(saved.getId());
        response.setPartyName(saved.getPartyName());
        response.setCompanyCode(saved.getCompanyCode());
        response.setBranchCode(saved.getBranchCode());
        response.setTbb(saved.getTbb());
        response.setMessage("Party created successfully");

        return response;
    }

    @Override
    public List<PartyResponseDTO> getPartiesByCompany(String companyCode) {

        List<PartyEntity> parties = partyRepository.findByCompanyCode(companyCode);

        return parties.stream().map(p -> {
            PartyResponseDTO dto = new PartyResponseDTO();
            dto.setId(p.getId());
            dto.setPartyName(p.getPartyName());
            dto.setDisplayName(p.getDisplayName());
            dto.setPartyCode(p.getPartyCode());
            dto.setPartyType(p.getPartyType());
            dto.setTbb(p.getTbb());
            dto.setMobileNumber1(p.getMobileNumber1());
            dto.setCity(p.getCity());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public List<PartyResponseDTO> searchParties(String companyCode, String partyName) {

        List<PartyEntity> parties;

        if (partyName == null || partyName.trim().isEmpty()) {
            parties = partyRepository.findByCompanyCode(companyCode);
        } else {
            parties = partyRepository.searchParties(companyCode, partyName);
        }

        return parties.stream().map(this::mapToDTO).toList();
    }

    private PartyResponseDTO mapToDTO(PartyEntity p) {

        PartyResponseDTO dto = new PartyResponseDTO();

        dto.setId(p.getId());
        dto.setPartyName(p.getPartyName());
        dto.setCompanyCode(p.getCompanyCode());
        dto.setBranchCode(p.getBranchCode());

        dto.setTbb(p.getTbb());

        dto.setDisplayName(p.getDisplayName());
        dto.setPartyCode(p.getPartyCode());
        dto.setPartyType(p.getPartyType());

        dto.setMobileNumber1(p.getMobileNumber1());
        dto.setCity(p.getCity());
        dto.setGstNumber(p.getGstNumber());

        dto.setMessage("SUCCESS");

        return dto;
    }
}
