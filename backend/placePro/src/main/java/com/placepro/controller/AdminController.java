package com.placepro.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.placepro.model.Admin;
import com.placepro.model.User;
import com.placepro.repository.AdminRepository;
import com.placepro.repository.JobRepository;
import com.placepro.repository.NotificationRepository;
import com.placepro.repository.UserRepository;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin("*")
public class AdminController {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final NotificationRepository notificationRepository;

    public AdminController(AdminRepository adminRepository, UserRepository userRepository, JobRepository jobRepository, NotificationRepository notificationRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<Admin> getAdmins() {
        return adminRepository.findAll();
    }

    @GetMapping("/{adminId}")
    public Map<String, Object> getAdmin(@PathVariable Long adminId) {
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        User user = userRepository.findById(admin.getUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Linked user not found"));
        return buildAdminResponse(admin, user);
    }

    @GetMapping("/by-user/{userId}")
    public Map<String, Object> getAdminByUserId(@PathVariable Long userId) {
        Admin admin = ensureAdminProfile(userId);

        User user = userRepository.findById(admin.getUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Linked user not found"));
        return buildAdminResponse(admin, user);
    }

    @PostMapping("/ensure-user/{userId}")
    public Map<String, Object> ensureAdminByUserId(@PathVariable Long userId) {
        Admin admin = ensureAdminProfile(userId);
        User user = userRepository.findById(admin.getUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Linked user not found"));
        return buildAdminResponse(admin, user);
    }

    @PostMapping
    public ResponseEntity<?> createAdmin(@RequestBody User adminUser) {
        if (adminUser.getName() == null || adminUser.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin name is required");
        }

        if (adminUser.getEmail() == null || adminUser.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin email is required");
        }

        if (adminUser.getPassword() == null || adminUser.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin password is required");
        }

        String email = adminUser.getEmail().trim();
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        adminUser.setName(adminUser.getName().trim());
        adminUser.setEmail(email);
        adminUser.setPassword(adminUser.getPassword().trim());
        adminUser.setRole("ADMIN");

        User savedUser = userRepository.save(adminUser);
        Admin admin = new Admin();
        admin.setUserId(savedUser.getId());
        admin.setName(savedUser.getName());
        Admin savedAdmin = adminRepository.save(admin);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Admin created successfully");
        response.put("admin", buildAdminResponse(savedAdmin, savedUser));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/users")
    public List<User> getUsers(@RequestParam(required = false) String role) {
        if (role == null || role.isBlank()) {
            return userRepository.findAll();
        }

        return userRepository.findByRoleIgnoreCase(role.trim());
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("adminCount", adminRepository.count());
        response.put("studentCount", userRepository.findByRoleIgnoreCase("STUDENT").size());
        response.put("recruiterCount", userRepository.findByRoleIgnoreCase("RECRUITER").size());
        response.put("jobCount", jobRepository.count());
        response.put("notificationCount", notificationRepository.count());
        return response;
    }

    private Map<String, Object> buildAdminResponse(Admin admin, User user) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("adminId", admin.getAdminId());
        response.put("userId", admin.getUserId());
        response.put("name", admin.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        return response;
    }

    private Admin ensureAdminProfile(Long userId) {
        Optional<Admin> existingAdmin = adminRepository.findByUserId(userId);
        if (existingAdmin.isPresent()) {
            return existingAdmin.get();
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not an admin");
        }

        Admin admin = new Admin();
        admin.setUserId(user.getId());
        admin.setName(user.getName());
        return adminRepository.save(admin);
    }
}
