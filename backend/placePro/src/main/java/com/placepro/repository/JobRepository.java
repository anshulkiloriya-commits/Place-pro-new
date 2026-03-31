package com.placepro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.placepro.model.Job;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAllByOrderByCreatedAtDesc();
    List<Job> findByPostedByAdminIdOrderByCreatedAtDesc(Long postedByAdminId);
}
