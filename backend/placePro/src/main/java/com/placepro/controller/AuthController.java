package com.placepro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//import org.springframework.security.crypto.password.PasswordEncoder;

import com.placepro.repository.AdminRepository;
import com.placepro.repository.UserRepository;
import com.placepro.repository.StudentRepository;
import com.placepro.model.Admin;
import com.placepro.model.User;
import com.placepro.model.Student;
import com.placepro.dto.LoginRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/*
 * AuthController
 * --------------
 * This controller handles authentication related APIs
 * such as user login and registration for the PlacePro system.
 */

@RestController                         // Marks this class as a REST API controller
@RequestMapping("/api")                 // Base URL for all APIs in this controller
@CrossOrigin(origins = "*")             // Allows frontend applications to access these APIs
public class AuthController {

    private ResponseEntity<Map<String, Object>> errorResponse(int status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }

    private String normalizeRoleForDatabase(String role) {
        return role == null ? null : role.trim().toUpperCase();
    }

    private String formatRoleForFrontend(String role) {
        if (role == null) {
            return null;
        }

        return switch (role.trim().toUpperCase()) {
            case "STUDENT" -> "Student";
            case "ADMIN" -> "Admin";
            case "RECRUITER" -> "Recruiter";
            default -> role;
        };
    }

    // Injecting UserRepository to interact with the database
    @Autowired
    private UserRepository userRepository;

    // Added so login can include the student's profile id in the frontend session.
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdminRepository adminRepository;

    /*
     * PasswordEncoder can be used to securely hash passwords
     * before storing them in the database and to verify passwords during login.
     * Currently commented out because password encryption is not enabled yet.
     */

    // @Autowired
    // private PasswordEncoder passwordEncoder;


    /*
     * Home API
     * --------
     * Simple test API to verify that the backend server is running.
     * URL: GET /api/
     */
    @GetMapping("/")
    public String home() {
        return "PlacePro API is running";
    }

    
    /*
     * Login API
     * ---------
     * This API authenticates a user using email, password and role.
     * URL: POST /api/login
     * Input: LoginRequest JSON (email, password, role)
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.getEmail() == null ? null : request.getEmail().trim();
        String password = request.getPassword() == null ? null : request.getPassword().trim();
        String role = request.getRole() == null ? null : request.getRole().trim();

        if (email == null || email.isEmpty()) {
            return errorResponse(400, "Email is required");
        }

        if (password == null || password.isEmpty()) {
            return errorResponse(400, "Password is required");
        }

        if (role == null || role.isEmpty()) {
            return errorResponse(400, "Role is required");
        }

        // Find user in database using email
        Optional<User> userData = userRepository.findByEmail(email);
        
        
        /*
         * Alternate Query Method using JPQL
         * ----------------------------------
         * @Query("SELECT u FROM User u WHERE u.email = :email")
         * Optional<User> findByEmail(@Param("email") String email);
         */

        // If user with given email does not exist
        if (!userData.isPresent()) {
            return errorResponse(401, "Email not found");
        }

        // Extract the actual user object from Optional after the check above.
        User user = userData.get();

        /*
         * Password verification (currently disabled)
         * If PasswordEncoder is used, it will compare
         * the entered password with the encrypted password in DB
         */
       if (!user.getPassword().equals(password)) {
           return errorResponse(401, "Incorrect password");
       }

        // Verify if selected role matches the role stored in database
        if (!user.getRole().equalsIgnoreCase(role)) {
            return errorResponse(401, "Incorrect role selected");
        }

        // Return JSON data instead of only a plain text message.
        // The frontend uses this to build localStorage session data.
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", formatRoleForFrontend(user.getRole()));

        if ("Student".equalsIgnoreCase(user.getRole())) {
            // Include the student enrollment number for loading the profile after login.
            studentRepository.findByUserId(user.getId())
                .ifPresent(value -> response.put("studentId", value.getEnrollmentNo()));
        }

        if ("Admin".equalsIgnoreCase(user.getRole())) {
            Admin admin = adminRepository.findByUserId(user.getId()).orElseGet(() -> {
                Admin newAdmin = new Admin();
                newAdmin.setUserId(user.getId());
                newAdmin.setName(user.getName());
                return adminRepository.save(newAdmin);
            });
            response.put("adminId", admin.getAdminId());
        }

        return ResponseEntity.ok(response);
    }


    /*
     * Registration API
     * ----------------
     * This API registers a new user into the system.
     * URL: POST /api/register
     * Input: User JSON (name, email, password, role etc.)
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        // Convert UI roles like "Student" into the uppercase values required by PostgreSQL.
        user.setRole(normalizeRoleForDatabase(user.getRole()));

        // Check if email already exists in database
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body("Email already in use");
        }

        /*
         * Password encryption before saving (recommended for security)
         * Currently disabled
         */
        // user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save new user in database
        User savedUser = userRepository.save(user);

        // Return the saved user data so the frontend gets a useful JSON response.
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration successful");
        response.put("id", savedUser.getId());
        response.put("name", savedUser.getName());
        response.put("email", savedUser.getEmail());
        response.put("role", formatRoleForFrontend(savedUser.getRole()));

        if ("ADMIN".equalsIgnoreCase(savedUser.getRole())) {
            Admin admin = adminRepository.findByUserId(savedUser.getId()).orElseGet(() -> {
                Admin newAdmin = new Admin();
                newAdmin.setUserId(savedUser.getId());
                newAdmin.setName(savedUser.getName());
                return adminRepository.save(newAdmin);
            });
            response.put("adminId", admin.getAdminId());
        }

        return ResponseEntity.ok(response);    
    }

}
