package com.placepro.controller;

// Import required Spring annotations
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

// Import your model and repository
import com.placepro.model.Student;
import com.placepro.model.User;
import com.placepro.repository.StudentRepository;
import com.placepro.repository.UserRepository;

// Marks this class as REST API controller
// It automatically converts Java objects → JSON
@RestController

// Base URL for all APIs in this controller
// Final URL will start with: http://localhost:8080/api/students
@RequestMapping("/api/students")

// Allows frontend (Live Server - port 5500) to call backend (port 8080)
@CrossOrigin("*")
public class StudentController {

    // Repository object to interact with database
    private final StudentRepository repo;
    private final UserRepository userRepository;

    // Constructor Injection (Spring automatically provides repo object)
    public StudentController(StudentRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
    }

    @GetMapping
    public java.util.List<Student> listStudents() {
        return repo.findAll();
    }

    // Match the student row with the already-created user row using email.
    private Long resolveUserId(Student student, Student existingStudent) {
        if (student.getUserId() != null) {
            return student.getUserId();
        }

        if (existingStudent != null && existingStudent.getUserId() != null) {
            return existingStudent.getUserId();
        }

        String email = student.getCollegeEmail();
        if (email == null || email.isBlank()) {
            email = student.getPersonalEmail();
        }

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student email is required");
        }

        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty() || user.get().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User account not found for this email");
        }

        return user.get().getId();
    }

    private void validateStudent(Student student) {
        if (student.getEnrollmentNo() == null || !student.getEnrollmentNo().matches("^[0-9]{4}[A-Z]{2}[0-9]{6}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID must match format 0801CA251022");
        }
        if (student.getMobile() != null && !student.getMobile().isBlank() && !student.getMobile().matches("^[0-9]{10}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number must be exactly 10 digits");
        }
        if (student.getAbcId() != null && !student.getAbcId().isBlank() && !student.getAbcId().matches("^[0-9]{12}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ABC ID must be exactly 12 digits");
        }
        if (student.getAadharNo() != null && !student.getAadharNo().isBlank() && !student.getAadharNo().matches("^[0-9]{12}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aadhaar number must be exactly 12 digits");
        }
        if (student.getPanNo() != null && !student.getPanNo().isBlank() && !student.getPanNo().matches("^[A-Z]{5}[0-9]{4}[A-Z]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PAN number format is invalid");
        }
    }

    
    //  1. SAVE STUDENT PROFILE


    // Handles POST request
    // URL: http://localhost:8080/api/students/profile
    @PostMapping("/profile")
    public Student saveProfile(@RequestBody Student student) {

        // @RequestBody converts JSON (from frontend) → Java object (Student)

        // user_id is required in the database, so resolve it from the matching user email.
        student.setUserId(resolveUserId(student, null));
        validateStudent(student);

        // Save student data into database
        Student savedStudent = repo.save(student);

        // Return saved object as JSON response
        return savedStudent;
    }

    // ================================
    //  2. GET STUDENT PROFILE BY ID
    // ================================

    // Handles GET request
    // URL: http://localhost:8080/api/students/1
    @GetMapping("/{sId}")
    public Student getStudent(@PathVariable String sId) {

        // @PathVariable gets value from URL (id = 1)

        // Find student in database by ID
        // If not found → return null
        return repo.findByEnrollmentNo(sId).orElse(null);
    }

    // ================================
    //  3. UPDATE STUDENT PROFILE
    // ================================

    // Handles PUT request
    // URL: http://localhost:8080/api/students/1
    @PutMapping("/{sId}")
    public Student updateStudent(@PathVariable String sId, @RequestBody Student student) {

        Student existingStudent = repo.findByEnrollmentNo(sId).orElse(null);

        // Set ID manually (important for update)
        // Without this, new record will be created instead of updating
        student.setEnrollmentNo(sId);
        // Preserve or resolve user_id so updates do not violate the database constraint.
        student.setUserId(resolveUserId(student, existingStudent));
        if (existingStudent != null && existingStudent.getId() != null) {
            student.setUserId(existingStudent.getUserId());
        }
        validateStudent(student);

        // Save updated data (Hibernate will update existing row)
        if (existingStudent != null) {
            // Reuse the existing row instead of creating a duplicate when updating by enrollment number.
            student.setId(existingStudent.getId());
        }
        return repo.save(student);
    }
}
