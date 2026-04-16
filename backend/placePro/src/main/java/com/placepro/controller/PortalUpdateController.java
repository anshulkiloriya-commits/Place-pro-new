package com.placepro.controller;

import com.placepro.model.PortalUpdate;
import com.placepro.repository.PortalUpdateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/updates")
@CrossOrigin("*")
public class PortalUpdateController {

    private final PortalUpdateRepository repository;

    public PortalUpdateController(PortalUpdateRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<PortalUpdate> listUpdates() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public PortalUpdate createUpdate(@RequestBody PortalUpdate update) {
        if (update.getMessage() == null || update.getMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Update message is required");
        }

        update.setId(null);
        update.setTitle(
            update.getTitle() == null || update.getTitle().isBlank()
                ? ((update.getSource() == null || update.getSource().isBlank()) ? "Portal Update" : update.getSource() + " Update")
                : update.getTitle().trim()
        );
        update.setType(update.getType() == null || update.getType().isBlank() ? "Update" : update.getType().trim());
        update.setSource(update.getSource() == null || update.getSource().isBlank() ? "Portal" : update.getSource().trim());
        update.setCreatedAt(LocalDateTime.now());

        return repository.save(update);
    }
}
