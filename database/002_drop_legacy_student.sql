-- Cleanup script to remove the legacy student table after the new students table is live.
-- This only drops foreign keys that still point at student(s_id), then drops the old table.

BEGIN;

ALTER TABLE IF EXISTS application
    DROP CONSTRAINT IF EXISTS application_s_id_fkey;

ALTER TABLE IF EXISTS certificate
    DROP CONSTRAINT IF EXISTS certificate_s_id_fkey;

ALTER TABLE IF EXISTS documents
    DROP CONSTRAINT IF EXISTS documents_s_id_fkey;

ALTER TABLE IF EXISTS education
    DROP CONSTRAINT IF EXISTS education_s_id_fkey;

ALTER TABLE IF EXISTS internship
    DROP CONSTRAINT IF EXISTS internship_s_id_fkey;

DROP TABLE IF EXISTS student;

COMMIT;
