package com.placepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.placepro.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    List<User> findByRoleIgnoreCase(String role);
}
