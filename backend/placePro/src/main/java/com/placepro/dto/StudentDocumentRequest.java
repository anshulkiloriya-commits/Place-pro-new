package com.placepro.dto;

public class StudentDocumentRequest {
    private String documentType;
    private String fileName;
    private String fileDataUrl;
    private String mimeType;
    private Long fileSizeBytes;

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileDataUrl() {
        return fileDataUrl;
    }

    public void setFileDataUrl(String fileDataUrl) {
        this.fileDataUrl = fileDataUrl;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }
}
