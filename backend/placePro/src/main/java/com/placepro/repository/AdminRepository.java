package com.placepro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.placepro.model.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUserId(Long userId);
}
