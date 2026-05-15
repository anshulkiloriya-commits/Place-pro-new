package com.placepro.controller;

import com.placepro.dto.StudentDocumentRequest;
import com.placepro.dto.StudentDocumentResponse;
import com.placepro.model.Student;
import com.placepro.model.StudentDocument;
import com.placepro.repository.StudentDocumentRepository;
import com.placepro.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/student-documents")
@CrossOrigin("*")
public class StudentDocumentController {

    private static final long MAX_FILE_SIZE_BYTES = 1_048_576L;
    private static final List<String> ALLOWED_DOCUMENT_TYPES = List.of(
        "resume",
        "tenthMarksheet",
        "twelfthMarksheet",
        "prd",
        "abcId",
        "aadhaarCard",
        "panCard",
        "domicileCertificate",
        "casteCertificate",
        "cvOnePage",
        "internshipCertificates",
        "skillCertificates",
        "otherCertificates"
    );
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
        "application/pdf",
        "image/jpeg",
        "image/png"
    );

    private final StudentRepository studentRepository;
    private final StudentDocumentRepository repository;

    public StudentDocumentController(StudentRepository studentRepository, StudentDocumentRepository repository) {
        this.studentRepository = studentRepository;
        this.repository = repository;
    }

    @GetMapping("/{enrollmentNo}")
    public List<StudentDocumentResponse> listDocuments(@PathVariable String enrollmentNo) {
        Student student = studentRepository.findByEnrollmentNo(enrollmentNo)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));

        return repository.findByStudentIdOrderByUploadedAtDesc(student.getId())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @PostMapping("/{enrollmentNo}")
    public StudentDocumentResponse saveDocument(@PathVariable String enrollmentNo, @RequestBody StudentDocumentRequest request) {
        Student student = studentRepository.findByEnrollmentNo(enrollmentNo)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));

        if (isBlank(request.getDocumentType()) || isBlank(request.getFileName()) || isBlank(request.getFileDataUrl())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document type, file name, and file data are required");
        }
        String documentType = request.getDocumentType().trim();
        String mimeType = normalizeMimeType(request.getMimeType(), request.getFileName());

        if (!ALLOWED_DOCUMENT_TYPES.contains(documentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported document type");
        }
        if (request.getFileSizeBytes() == null || request.getFileSizeBytes() <= 0 || request.getFileSizeBytes() >= MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size must be less than 1 MB");
        }
        if (!ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF/JPG/PNG files are allowed");
        }

        StudentDocument document = repository.findByStudentIdAndDocumentType(student.getId(), documentType)
            .orElseGet(StudentDocument::new);

        document.setStudentId(student.getId());
        document.setDocumentType(documentType);
        document.setFileName(request.getFileName().trim());
        document.setFilePath(request.getFileDataUrl());
        document.setMimeType(mimeType);
        document.setFileSizeBytes(request.getFileSizeBytes());
        document.setUploadedAt(LocalDateTime.now());

        return toResponse(repository.save(document));
    }

    private String normalizeMimeType(String mimeType, String fileName) {
        String normalized = mimeType == null ? "" : mimeType.trim().toLowerCase();
        if (normalized.equals("image/jpg")) {
            return "image/jpeg";
        }
        if (!normalized.isBlank()) {
            return normalized;
        }

        String lowerFileName = fileName == null ? "" : fileName.toLowerCase();
        if (lowerFileName.endsWith(".pdf")) {
            return "application/pdf";
        }
        if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lowerFileName.endsWith(".png")) {
            return "image/png";
        }
        return normalized;
    }

    private StudentDocumentResponse toResponse(StudentDocument document) {
        StudentDocumentResponse response = new StudentDocumentResponse();
        response.setId(document.getId());
        response.setDocumentType(document.getDocumentType());
        response.setFileName(document.getFileName());
        response.setFileUrl(document.getFilePath());
        response.setMimeType(document.getMimeType());
        response.setFileSizeBytes(document.getFileSizeBytes());
        response.setUploadedAt(document.getUploadedAt());
        return response;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
