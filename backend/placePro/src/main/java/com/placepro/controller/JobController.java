package com.placepro.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.placepro.model.Admin;
import com.placepro.model.Job;
import com.placepro.repository.AdminRepository;
import com.placepro.repository.JobRepository;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin("*")
public class JobController {

    private final AdminRepository adminRepository;
    private final JobRepository jobRepository;

    public JobController(AdminRepository adminRepository, JobRepository jobRepository) {
        this.adminRepository = adminRepository;
        this.jobRepository = jobRepository;
    }

    @GetMapping
    public List<Job> getJobs(@RequestParam(required = false) Long adminId) {
        if (adminId != null) {
            return jobRepository.findByPostedByAdminIdOrderByCreatedAtDesc(adminId);
        }

        return jobRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{jobId}")
    public Job getJob(@PathVariable Long jobId) {
        return jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        validateJob(job);
        verifyAdmin(job.getPostedByAdminId());

        Job savedJob = jobRepository.save(job);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Job posted successfully");
        response.put("job", savedJob);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{jobId}")
    public Job updateJob(@PathVariable Long jobId, @RequestBody Job job) {
        Job existingJob = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));

        validateJob(job);
        verifyAdmin(job.getPostedByAdminId());

        job.setId(existingJob.getId());
        if (job.getCreatedAt() == null) {
            job.setCreatedAt(existingJob.getCreatedAt());
        }
        return jobRepository.save(job);
    }

    @DeleteMapping("/{jobId}")
    public Map<String, String> deleteJob(@PathVariable Long jobId) {
        Job existingJob = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));

        jobRepository.delete(existingJob);
        return Map.of("message", "Job deleted successfully");
    }

    private void validateJob(Job job) {
        if (job.getTitle() == null || job.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job title is required");
        }
        if (job.getCompanyName() == null || job.getCompanyName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company name is required");
        }
        if (job.getDescription() == null || job.getDescription().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job description is required");
        }
        if (job.getPostedByAdminId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "postedByAdminId is required");
        }
    }

    private void verifyAdmin(Long adminId) {
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "postedByAdminId must belong to an admin"));
    }
}
