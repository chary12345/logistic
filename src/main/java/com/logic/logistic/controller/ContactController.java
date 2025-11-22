package com.logic.logistic.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.dto.Contact;
import com.logic.logistic.service.ContactService;

@RestController
@RequestMapping("/contacts")
@CrossOrigin("*")
public class ContactController {

    private final ContactService svc;

    public ContactController(ContactService svc) {
        this.svc = svc;
    }

    @GetMapping("/search")
    public List<Contact> search(
            @RequestParam String type,
            @RequestParam String q) {
        return svc.search(type, q);
    }

    @PostMapping
    public ResponseEntity<Contact> save(@RequestBody Contact c) {
        return ResponseEntity.ok(svc.saveSmart(c));
    }
}

