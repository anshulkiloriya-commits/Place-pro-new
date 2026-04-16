package com.placepro.repository;

import com.placepro.model.ApplicationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRecordRepository extends JpaRepository<ApplicationRecord, Long> {
    List<ApplicationRecord> findAllByOrderByAppliedAtDesc();
    List<ApplicationRecord> findByStudentIdOrderByAppliedAtDesc(String studentId);
}
