package com.placepro.controller;

import com.placepro.model.ApplicationRecord;
import com.placepro.repository.ApplicationRecordRepository;
import com.placepro.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin("*")
public class ApplicationController {

    private final ApplicationRecordRepository repository;
    private final StudentRepository studentRepository;

    public ApplicationController(ApplicationRecordRepository repository, StudentRepository studentRepository) {
        this.repository = repository;
        this.studentRepository = studentRepository;
    }

    @GetMapping
    public List<ApplicationRecord> listApplications() {
        return repository.findAllByOrderByAppliedAtDesc();
    }

    @GetMapping("/student/{enrollmentNo}")
    public List<ApplicationRecord> listStudentApplications(@PathVariable String enrollmentNo) {
        return repository.findByStudentIdOrderByAppliedAtDesc(enrollmentNo);
    }

    @PostMapping
    public ApplicationRecord createApplication(@RequestBody ApplicationRecord application) {
        if (isBlank(application.getStudentId()) || isBlank(application.getStudentName()) || isBlank(application.getCompany())
            || isBlank(application.getRole()) || isBlank(application.getLocation()) || isBlank(application.getCollegeEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Required application fields are missing");
        }

        studentRepository.findByEnrollmentNo(application.getStudentId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student profile not found for this application"));

        application.setId(null);
        application.setStatus(isBlank(application.getStatus()) ? "Pending Review" : application.getStatus().trim());
        application.setAppliedAt(LocalDateTime.now());

        return repository.save(application);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
