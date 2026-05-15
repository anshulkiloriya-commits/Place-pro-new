-- Adds recruiter workflow, interview, hiring, and filtering fields.

BEGIN;

ALTER TABLE IF EXISTS applications
    ADD COLUMN IF NOT EXISTS branch VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cgpa NUMERIC(38, 2),
    ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hiring_status VARCHAR(255),
    ADD COLUMN IF NOT EXISTS interview_round VARCHAR(255),
    ADD COLUMN IF NOT EXISTS interview_status VARCHAR(255),
    ADD COLUMN IF NOT EXISTS interview_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS interview_location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS interview_link VARCHAR(255),
    ADD COLUMN IF NOT EXISTS recruiter_remarks VARCHAR(4000),
    ADD COLUMN IF NOT EXISTS last_recruiter_action_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_applications_pipeline_stage ON applications(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_applications_hiring_status ON applications(hiring_status);
CREATE INDEX IF NOT EXISTS idx_applications_interview_round ON applications(interview_round);

COMMIT;
