package com.logic.logistic.service;


import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logic.logistic.dto.Contact;
import com.logic.logistic.repository.ContactRepository;

@Service
public class ContactService {

    private final ContactRepository repo;

    public ContactService(ContactRepository repo) {
        this.repo = repo;
    }

    // ---- SEARCH with REDIS CACHE ----
    @Cacheable(cacheNames = "contacts", key = "#type + ':' + #branchCode + ':' + #q") 
    public List<Contact> search(String type, String q,String branchCode) {
    	return repo.findTop10ByTypeAndBranchCodeAndNameContainingIgnoreCaseOrderByNameAsc(
                type,
                branchCode,
                q
        );
    }

    // ---- SMART SAVE : same name + diff fields => NEW RECORD ----
    @Transactional
    @CacheEvict(cacheNames = "contacts", allEntries = true)
    public Contact saveSmart(Contact input) {

        String name = input.getName().trim();
        String type = input.getType();
        String branchCode = safe(input.getBranchCode());
        
        List<Contact> matches =
                repo.findTop10ByTypeAndBranchCodeAndNameContainingIgnoreCaseOrderByNameAsc(
                        type, branchCode, name
                );
        // If same name + exact same details => update
        for (Contact c : matches) {
            if (c.getName().equalsIgnoreCase(name)
                    && safe(c.getMobile()).equals(safe(input.getMobile()))
                    && safe(c.getGst()).equals(safe(input.getGst()))
                    && safe(c.getAddress()).equals(safe(input.getAddress()))) {

                c.setMobile(input.getMobile());
                c.setGst(input.getGst());
                c.setAddress(input.getAddress());
                return repo.save(c);
            }
        }

        // Else create new row
        Contact newC = new Contact();
        newC.setType(type);
        newC.setName(name);
        newC.setMobile(input.getMobile());
        newC.setGst(input.getGst());
        newC.setAddress(input.getAddress());
        newC.setBranchCode(branchCode);
        return repo.save(newC);
    }

    private String safe(String s) {
        return s == null ? "" : s.trim();
    }
}
