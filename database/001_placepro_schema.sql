-- PlacePro schema migration
-- Creates the new students/profile schema without deleting the old student table.

BEGIN;

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    enrollment_no VARCHAR(12) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    personal_email VARCHAR(255),
    college_email VARCHAR(255),
    mobile VARCHAR(10),
    dob DATE,
    father_name VARCHAR(255),
    father_mobile VARCHAR(10),
    mother_name VARCHAR(255),
    mother_mobile VARCHAR(10),
    class_name VARCHAR(100),
    section VARCHAR(50),
    abc_id VARCHAR(12),
    aadhar_no VARCHAR(12),
    pan_no VARCHAR(10),
    student_image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT students_enrollment_check CHECK (enrollment_no ~ '^[0-9]{4}[A-Z]{2}[0-9]{6}$'),
    CONSTRAINT students_mobile_check CHECK (mobile IS NULL OR mobile ~ '^[0-9]{10}$'),
    CONSTRAINT students_father_mobile_check CHECK (father_mobile IS NULL OR father_mobile ~ '^[0-9]{10}$'),
    CONSTRAINT students_mother_mobile_check CHECK (mother_mobile IS NULL OR mother_mobile ~ '^[0-9]{10}$'),
    CONSTRAINT students_abc_id_check CHECK (abc_id IS NULL OR abc_id ~ '^[0-9]{12}$'),
    CONSTRAINT students_aadhar_check CHECK (aadhar_no IS NULL OR aadhar_no ~ '^[0-9]{12}$'),
    CONSTRAINT students_pan_check CHECK (pan_no IS NULL OR pan_no ~ '^[A-Z]{5}[0-9]{4}[A-Z]$')
);

CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_no ON students(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_students_college_email ON students(college_email);

CREATE TABLE IF NOT EXISTS student_documents (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT student_documents_size_check CHECK (file_size_bytes <= 1048576)
);

CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_type ON student_documents(document_type);

INSERT INTO students (
    user_id,
    enrollment_no,
    full_name,
    college_email,
    mobile,
    dob,
    father_name,
    mother_name,
    class_name,
    section,
    aadhar_no,
    pan_no
)
SELECT
    s.user_id,
    s.s_id,
    s.full_name,
    s.email,
    CASE WHEN s.phone_no ~ '^[0-9]{10}$' THEN s.phone_no ELSE NULL END,
    s.dob,
    s.father_name,
    s.mother_name,
    s.branch,
    s.branch_discipline,
    CASE WHEN s.aadhar_no ~ '^[0-9]{12}$' THEN s.aadhar_no ELSE NULL END,
    CASE WHEN s.pan_no ~ '^[A-Z]{5}[0-9]{4}[A-Z]$' THEN s.pan_no ELSE NULL END
FROM student s
WHERE s.s_id ~ '^[0-9]{4}[A-Z]{2}[0-9]{6}$'
  AND NOT EXISTS (
      SELECT 1
      FROM students ns
      WHERE ns.enrollment_no = s.s_id
  );

COMMIT;
