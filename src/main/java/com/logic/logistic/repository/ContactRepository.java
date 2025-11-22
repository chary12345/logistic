package com.logic.logistic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logic.logistic.dto.Contact;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findTop10ByTypeAndNameContainingIgnoreCaseOrderByNameAsc(
            String type, String name);

}
