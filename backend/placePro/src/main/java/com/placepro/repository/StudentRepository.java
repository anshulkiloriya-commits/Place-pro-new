package com.placepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.placepro.model.Student;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEnrollmentNo(String enrollmentNo);
    Optional<Student> findByUserId(Long userId);
}
