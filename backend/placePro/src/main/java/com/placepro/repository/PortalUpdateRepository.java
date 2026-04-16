package com.placepro.repository;

import com.placepro.model.PortalUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortalUpdateRepository extends JpaRepository<PortalUpdate, Long> {
    List<PortalUpdate> findAllByOrderByCreatedAtDesc();
}
