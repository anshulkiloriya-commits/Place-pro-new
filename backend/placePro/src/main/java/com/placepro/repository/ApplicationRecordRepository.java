package com.placepro.repository;

import com.placepro.model.ApplicationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ApplicationRecordRepository extends JpaRepository<ApplicationRecord, Long> {
    List<ApplicationRecord> findAllByOrderByAppliedAtDesc();
    List<ApplicationRecord> findByStudentIdOrderByAppliedAtDesc(String studentId);

    @Query("""
        select application
        from ApplicationRecord application
        join Opportunity opportunity on opportunity.id = application.opportunityId
        where opportunity.postedByUserId = :recruiterUserId
        order by application.appliedAt desc
        """)
    List<ApplicationRecord> findRecruiterApplications(@Param("recruiterUserId") Long recruiterUserId);

    @Query("""
        select count(application)
        from ApplicationRecord application
        join Opportunity opportunity on opportunity.id = application.opportunityId
        where application.id = :applicationId and opportunity.postedByUserId = :recruiterUserId
        """)
    long countRecruiterOwnedApplication(@Param("applicationId") Long applicationId, @Param("recruiterUserId") Long recruiterUserId);
}
