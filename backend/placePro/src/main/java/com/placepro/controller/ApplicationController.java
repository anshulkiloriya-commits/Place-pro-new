package com.placepro.controller;

import com.placepro.model.ApplicationRecord;
import com.placepro.repository.ApplicationRecordRepository;
import com.placepro.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin("*")
public class ApplicationController {
    private static final String MOBILE_MESSAGE = "Mobile number must contain exactly 10 digits without country code";

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

    @GetMapping("/recruiter/{recruiterUserId}")
    public List<ApplicationRecord> listRecruiterApplications(@PathVariable Long recruiterUserId) {
        return repository.findRecruiterApplications(recruiterUserId);
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
        if (!isBlank(application.getMobile()) && !application.getMobile().matches("^[0-9]{10}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, MOBILE_MESSAGE);
        }

        studentRepository.findByEnrollmentNo(application.getStudentId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student profile not found for this application"));

        application.setId(null);
        application.setStatus(isBlank(application.getStatus()) ? "Pending Review" : application.getStatus().trim());
        application.setPipelineStage(isBlank(application.getPipelineStage()) ? "Applied" : application.getPipelineStage().trim());
        application.setHiringStatus(isBlank(application.getHiringStatus()) ? "On Hold" : application.getHiringStatus().trim());
        application.setInterviewStatus(isBlank(application.getInterviewStatus()) ? "Pending" : application.getInterviewStatus().trim());
        application.setAppliedAt(LocalDateTime.now());

        return repository.save(application);
    }

    @PatchMapping("/{applicationId}/recruiter/{recruiterUserId}")
    public ApplicationRecord updateRecruiterWorkflow(
        @PathVariable Long applicationId,
        @PathVariable Long recruiterUserId,
        @RequestBody Map<String, String> updates
    ) {
        if (repository.countRecruiterOwnedApplication(applicationId, recruiterUserId) == 0) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter cannot access this application");
        }

        ApplicationRecord application = repository.findById(applicationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        applyIfPresent(updates, "status", application::setStatus);
        applyIfPresent(updates, "pipelineStage", application::setPipelineStage);
        applyIfPresent(updates, "hiringStatus", application::setHiringStatus);
        applyIfPresent(updates, "interviewRound", application::setInterviewRound);
        applyIfPresent(updates, "interviewStatus", application::setInterviewStatus);
        applyIfPresent(updates, "interviewLocation", application::setInterviewLocation);
        applyIfPresent(updates, "interviewLink", application::setInterviewLink);
        applyIfPresent(updates, "recruiterRemarks", application::setRecruiterRemarks);

        String interviewAt = updates.get("interviewAt");
        if (!isBlank(interviewAt)) {
            application.setInterviewAt(LocalDateTime.parse(interviewAt));
        }

        application.setLastRecruiterActionAt(LocalDateTime.now());
        return repository.save(application);
    }

    private void applyIfPresent(Map<String, String> updates, String key, java.util.function.Consumer<String> setter) {
        if (updates.containsKey(key)) {
            String value = updates.get(key);
            setter.accept(isBlank(value) ? null : value.trim());
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
