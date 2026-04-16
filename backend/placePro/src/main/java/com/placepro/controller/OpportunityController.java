package com.placepro.controller;

import com.placepro.model.Opportunity;
import com.placepro.repository.OpportunityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
@CrossOrigin("*")
public class OpportunityController {

    private final OpportunityRepository repository;

    public OpportunityController(OpportunityRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Opportunity> listOpportunities() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Opportunity createOpportunity(@RequestBody Opportunity opportunity) {
        if (isBlank(opportunity.getType()) || isBlank(opportunity.getCompany()) || isBlank(opportunity.getRole())
            || isBlank(opportunity.getLocation()) || isBlank(opportunity.getPackageValue()) || isBlank(opportunity.getDescription())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All opportunity fields are required");
        }

        opportunity.setId(null);
        opportunity.setType(opportunity.getType().trim());
        opportunity.setCompany(opportunity.getCompany().trim());
        opportunity.setRole(opportunity.getRole().trim());
        opportunity.setLocation(opportunity.getLocation().trim());
        opportunity.setPackageValue(opportunity.getPackageValue().trim());
        opportunity.setDescription(opportunity.getDescription().trim());
        opportunity.setCreatedAt(LocalDateTime.now());

        return repository.save(opportunity);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
