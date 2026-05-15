-- Expand document/application storage so base64 PDF uploads fit safely.

BEGIN;

ALTER TABLE IF EXISTS student_documents
    ALTER COLUMN file_path TYPE TEXT;

ALTER TABLE IF EXISTS applications
    ALTER COLUMN resume_url TYPE TEXT;

ALTER TABLE IF EXISTS student_documents
    DROP CONSTRAINT IF EXISTS student_documents_size_check,
    ADD CONSTRAINT student_documents_size_check CHECK (file_size_bytes < 1048576);

COMMIT;
