package com.placepro.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class ApplicationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "opportunity_id")
    private Long opportunityId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String location;

    @Column(name = "package_value")
    private String packageValue;

    @Column(nullable = false)
    private String status;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;

    private LocalDate dob;
    private String mobile;

    @Column(name = "college_email")
    private String collegeEmail;

    @Column(name = "tenth_marks")
    private BigDecimal tenthMarks;

    @Column(name = "twelfth_marks")
    private BigDecimal twelfthMarks;

    @Column(name = "graduation_marks")
    private BigDecimal graduationMarks;

    @Column(name = "post_graduation_marks")
    private BigDecimal postGraduationMarks;

    @Column(name = "additional_info", length = 4000)
    private String additionalInfo;

    @Column(name = "resume_name")
    private String resumeName;

    @Column(name = "resume_url", length = 4000)
    private String resumeUrl;

    @Column(name = "resume_type")
    private String resumeType;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOpportunityId() {
        return opportunityId;
    }

    public void setOpportunityId(Long opportunityId) {
        this.opportunityId = opportunityId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPackageValue() {
        return packageValue;
    }

    public void setPackageValue(String packageValue) {
        this.packageValue = packageValue;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getCollegeEmail() {
        return collegeEmail;
    }

    public void setCollegeEmail(String collegeEmail) {
        this.collegeEmail = collegeEmail;
    }

    public BigDecimal getTenthMarks() {
        return tenthMarks;
    }

    public void setTenthMarks(BigDecimal tenthMarks) {
        this.tenthMarks = tenthMarks;
    }

    public BigDecimal getTwelfthMarks() {
        return twelfthMarks;
    }

    public void setTwelfthMarks(BigDecimal twelfthMarks) {
        this.twelfthMarks = twelfthMarks;
    }

    public BigDecimal getGraduationMarks() {
        return graduationMarks;
    }

    public void setGraduationMarks(BigDecimal graduationMarks) {
        this.graduationMarks = graduationMarks;
    }

    public BigDecimal getPostGraduationMarks() {
        return postGraduationMarks;
    }

    public void setPostGraduationMarks(BigDecimal postGraduationMarks) {
        this.postGraduationMarks = postGraduationMarks;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public String getResumeName() {
        return resumeName;
    }

    public void setResumeName(String resumeName) {
        this.resumeName = resumeName;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public String getResumeType() {
        return resumeType;
    }

    public void setResumeType(String resumeType) {
        this.resumeType = resumeType;
    }
}
