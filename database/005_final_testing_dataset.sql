-- PlacePro final QA dataset
-- WARNING: This script resets application data and loads a deterministic demo dataset.
-- Run only against a local/testing database.

BEGIN;

TRUNCATE TABLE
    student_documents,
    applications,
    opportunities,
    portal_updates,
    students,
    users
RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, password, role)
VALUES
    ('Placement Super Admin', 'admin@test.com', 'admin123', 'ADMIN'),
    ('Infosys Recruiter', 'recruiter@infosys.com', 'recruiter123', 'RECRUITER'),
    ('TCS Recruiter', 'recruiter@tcs.com', 'recruiter123', 'RECRUITER'),
    ('Wipro Recruiter', 'recruiter@wipro.com', 'recruiter123', 'RECRUITER'),
    ('Accenture Recruiter', 'recruiter@accenture.com', 'recruiter123', 'RECRUITER'),
    ('Cognizant Recruiter', 'recruiter@cognizant.com', 'recruiter123', 'RECRUITER'),
    ('Deloitte Recruiter', 'recruiter@deloitte.com', 'recruiter123', 'RECRUITER'),
    ('Capgemini Recruiter', 'recruiter@capgemini.com', 'recruiter123', 'RECRUITER');

DO $$
DECLARE
    branches text[] := ARRAY['CA', 'IT', 'CS', 'CV'];
    branch_names text[] := ARRAY['Computer Applications', 'Information Technology', 'Computer Science', 'Civil Engineering'];
    first_names text[] := ARRAY[
        'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
        'Anaya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Kavya', 'Riya', 'Anika', 'Ira', 'Nisha'
    ];
    last_names text[] := ARRAY[
        'Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Jain', 'Mehta', 'Yadav', 'Chauhan', 'Rao',
        'Nair', 'Iyer', 'Khan', 'Mishra', 'Saxena', 'Joshi', 'Bansal', 'Kapoor', 'Kulkarni', 'Reddy'
    ];
    b_idx integer;
    i integer;
    student_no integer := 0;
    tail integer;
    enrollment text;
    email text;
    mobile text;
    full_name text;
    saved_user_id bigint;
BEGIN
    FOR b_idx IN 1..array_length(branches, 1) LOOP
        FOR i IN 1..30 LOOP
            student_no := student_no + 1;
            tail := CASE WHEN branches[b_idx] IN ('CS', 'CV') THEN 1100 + i ELSE 1000 + i END;
            enrollment := '0801' || branches[b_idx] || '25' || tail::text;
            email := 'student' || lpad(student_no::text, 3, '0') || '@test.com';
            mobile := (9000000000 + student_no)::text;
            full_name := first_names[((student_no - 1) % array_length(first_names, 1)) + 1]
                || ' '
                || last_names[((student_no + b_idx - 2) % array_length(last_names, 1)) + 1];

            INSERT INTO users (name, email, password, role)
            VALUES (full_name, email, 'student123', 'STUDENT')
            RETURNING user_id INTO saved_user_id;

            INSERT INTO students (
                user_id,
                enrollment_no,
                full_name,
                personal_email,
                college_email,
                mobile,
                dob,
                father_name,
                father_mobile,
                mother_name,
                mother_mobile,
                class_name,
                section,
                abc_id,
                aadhar_no,
                pan_no,
                student_image
            )
            VALUES (
                saved_user_id,
                enrollment,
                full_name,
                lower(replace(full_name, ' ', '.')) || student_no::text || '@example.com',
                email,
                mobile,
                DATE '2003-01-01' + ((student_no % 900) * INTERVAL '1 day'),
                'Mr. ' || last_names[((student_no + 3) % array_length(last_names, 1)) + 1],
                (9100000000 + student_no)::text,
                'Mrs. ' || last_names[((student_no + 5) % array_length(last_names, 1)) + 1],
                (9200000000 + student_no)::text,
                branch_names[b_idx],
                chr(65 + ((i - 1) % 3)),
                lpad((250000000000 + student_no)::text, 12, '0'),
                lpad((810000000000 + student_no)::text, 12, '0'),
                'ABCDE' || lpad(((1000 + student_no) % 10000)::text, 4, '0') || 'Z',
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='
            );
        END LOOP;
    END LOOP;
END $$;

WITH doc_templates(document_type, file_name, mime_type, file_path, file_size_bytes) AS (
    VALUES
        (
            'resume',
            'resume.pdf',
            'application/pdf',
            'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9Db3VudCAwID4+CmVuZG9iagoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+PgolJUVPRg==',
            512
        ),
        (
            'aadhaarCard',
            'aadhaar.png',
            'image/png',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
            128
        ),
        (
            'panCard',
            'pan.png',
            'image/png',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
            128
        ),
        (
            'abcId',
            'abc-id.pdf',
            'application/pdf',
            'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9Db3VudCAwID4+CmVuZG9iagoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+PgolJUVPRg==',
            512
        ),
        (
            'domicileCertificate',
            'domicile.pdf',
            'application/pdf',
            'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9Db3VudCAwID4+CmVuZG9iagoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+PgolJUVPRg==',
            512
        ),
        (
            'casteCertificate',
            'caste.pdf',
            'application/pdf',
            'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9Db3VudCAwID4+CmVuZG9iagoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+PgolJUVPRg==',
            512
        )
)
INSERT INTO student_documents (
    student_id,
    document_type,
    file_name,
    file_path,
    mime_type,
    file_size_bytes,
    uploaded_at
)
SELECT
    s.id,
    d.document_type,
    s.enrollment_no || '_' || d.file_name,
    d.file_path,
    d.mime_type,
    d.file_size_bytes,
    NOW() - ((s.id % 20) * INTERVAL '1 day')
FROM students s
CROSS JOIN doc_templates d;

WITH companies(email, company) AS (
    VALUES
        ('recruiter@infosys.com', 'Infosys'),
        ('recruiter@tcs.com', 'TCS'),
        ('recruiter@wipro.com', 'Wipro'),
        ('recruiter@accenture.com', 'Accenture'),
        ('recruiter@cognizant.com', 'Cognizant'),
        ('recruiter@deloitte.com', 'Deloitte'),
        ('recruiter@capgemini.com', 'Capgemini')
),
roles(role, type, location, package_value, min_cgpa, branches) AS (
    VALUES
        ('Software Developer', 'Full Time', 'Bengaluru', '6.5 LPA', '7.0', 'CA, IT, CS'),
        ('Data Analyst', 'Full Time', 'Hyderabad', '5.8 LPA', '6.8', 'CA, IT, CS'),
        ('Frontend Developer', 'Full Time', 'Pune', '5.5 LPA', '6.5', 'CA, IT, CS'),
        ('Backend Developer', 'Full Time', 'Chennai', '6.2 LPA', '7.2', 'IT, CS'),
        ('Cloud Engineer', 'Full Time', 'Noida', '7.0 LPA', '7.5', 'IT, CS'),
        ('QA Engineer', 'Internship + PPO', 'Indore', '4.8 LPA', '6.0', 'CA, IT, CS, CV')
)
INSERT INTO opportunities (
    type,
    company,
    role,
    location,
    package_value,
    deadline,
    description,
    posted_by_user_id,
    created_at
)
SELECT
    r.type,
    c.company,
    r.role,
    r.location,
    r.package_value,
    CURRENT_DATE + (15 + ((row_number() OVER ())::integer % 45)),
    'Final QA opening for ' || r.role || '. Minimum CGPA: ' || r.min_cgpa
        || '. Eligible branches: ' || r.branches
        || '. Includes realistic test applicants for filtering, candidate pipeline, interviews, hiring status, and recruiter communication.',
    u.user_id,
    NOW() - (((row_number() OVER ()) % 12) * INTERVAL '1 day')
FROM companies c
JOIN users u ON u.email = c.email
CROSS JOIN roles r;

DO $$
DECLARE
    opp record;
    stu record;
    candidate_index integer;
    stage_values text[] := ARRAY['Applied', 'Shortlisted', 'Interview Scheduled', 'Moved to Next Round', 'Selected', 'Rejected'];
    interview_round_values text[] := ARRAY['Aptitude', 'Technical', 'HR'];
    stage text;
    hiring text;
    interview_status text;
    cgpa_value numeric(4,2);
    resume_pdf text := 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9Db3VudCAwID4+CmVuZG9iagoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+PgolJUVPRg==';
BEGIN
    FOR opp IN SELECT * FROM opportunities ORDER BY id LOOP
        candidate_index := 0;

        FOR stu IN
            SELECT *
            FROM students
            WHERE (id % 7 = opp.id % 7)
               OR (id % 11 = opp.id % 5)
               OR (id % 13 = opp.id % 3)
            ORDER BY id
            LIMIT 16
        LOOP
            candidate_index := candidate_index + 1;
            stage := stage_values[((candidate_index + opp.id)::integer % array_length(stage_values, 1)) + 1];
            cgpa_value := round((5.0 + (((stu.id * 7 + opp.id * 3) % 49)::numeric / 10)), 2);

            hiring := CASE stage
                WHEN 'Selected' THEN CASE WHEN candidate_index % 2 = 0 THEN 'Final Selected' ELSE 'Offer Sent' END
                WHEN 'Rejected' THEN 'Rejected'
                WHEN 'Moved to Next Round' THEN 'On Hold'
                ELSE 'Pending'
            END;

            interview_status := CASE
                WHEN stage IN ('Interview Scheduled') THEN 'Pending'
                WHEN stage IN ('Moved to Next Round', 'Selected') THEN 'Completed'
                WHEN stage = 'Rejected' AND candidate_index % 2 = 0 THEN 'Rejected'
                ELSE NULL
            END;

            INSERT INTO applications (
                opportunity_id,
                student_id,
                student_name,
                company,
                role,
                location,
                package_value,
                branch,
                cgpa,
                status,
                pipeline_stage,
                hiring_status,
                interview_round,
                interview_status,
                interview_at,
                interview_location,
                interview_link,
                recruiter_remarks,
                last_recruiter_action_at,
                applied_at,
                dob,
                mobile,
                college_email,
                tenth_marks,
                twelfth_marks,
                graduation_marks,
                post_graduation_marks,
                additional_info,
                resume_name,
                resume_url,
                resume_type
            )
            VALUES (
                opp.id,
                stu.enrollment_no,
                stu.full_name,
                opp.company,
                opp.role,
                opp.location,
                opp.package_value,
                stu.class_name,
                cgpa_value,
                stage,
                stage,
                hiring,
                CASE WHEN stage IN ('Interview Scheduled', 'Moved to Next Round', 'Selected', 'Rejected')
                    THEN interview_round_values[((candidate_index + opp.id)::integer % array_length(interview_round_values, 1)) + 1]
                    ELSE NULL
                END,
                interview_status,
                CASE WHEN stage IN ('Interview Scheduled', 'Moved to Next Round', 'Selected', 'Rejected')
                    THEN NOW() + (((candidate_index % 12) + 1) * INTERVAL '1 day') + ((candidate_index % 5) * INTERVAL '1 hour')
                    ELSE NULL
                END,
                CASE WHEN stage IN ('Interview Scheduled', 'Moved to Next Round', 'Selected', 'Rejected')
                    THEN 'Placement Cell Room ' || ((candidate_index % 4) + 1)::text
                    ELSE NULL
                END,
                CASE WHEN stage IN ('Interview Scheduled', 'Moved to Next Round', 'Selected', 'Rejected')
                    THEN 'https://meet.example.com/' || lower(replace(opp.company, ' ', '-')) || '-' || opp.id::text || '-' || candidate_index::text
                    ELSE NULL
                END,
                CASE stage
                    WHEN 'Applied' THEN 'Profile pending initial screening.'
                    WHEN 'Shortlisted' THEN 'Shortlisted based on CGPA and branch criteria.'
                    WHEN 'Interview Scheduled' THEN 'Interview details sent to candidate.'
                    WHEN 'Moved to Next Round' THEN 'Cleared current round; awaiting next panel.'
                    WHEN 'Selected' THEN 'Candidate selected for final hiring action.'
                    ELSE 'Candidate does not match current role requirements.'
                END,
                CASE WHEN stage <> 'Applied' THEN NOW() - ((candidate_index % 5) * INTERVAL '1 day') ELSE NULL END,
                NOW() - (((candidate_index + opp.id) % 30) * INTERVAL '1 day'),
                stu.dob,
                stu.mobile,
                stu.college_email,
                round((70 + ((stu.id + opp.id) % 26))::numeric, 2),
                round((68 + ((stu.id + opp.id * 2) % 28))::numeric, 2),
                cgpa_value,
                CASE WHEN stu.id % 4 = 0 THEN round((7.0 + ((stu.id + opp.id) % 24)::numeric / 10), 2) ELSE NULL END,
                'Seeded QA candidate for filters, resume preview, pipeline movement, interview management, and hiring status testing.',
                stu.enrollment_no || '_resume.pdf',
                resume_pdf,
                'application/pdf'
            );
        END LOOP;
    END LOOP;
END $$;

INSERT INTO portal_updates (
    title,
    message,
    type,
    source,
    link,
    created_by_user_id,
    created_at
)
SELECT
    'Final QA schedule published',
    'Use the seeded dataset to verify admin, student, recruiter, document, communication, and pipeline workflows.',
    'Announcement',
    'Admin',
    NULL,
    u.user_id,
    NOW()
FROM users u
WHERE u.email = 'admin@test.com';

INSERT INTO portal_updates (
    title,
    message,
    type,
    source,
    link,
    created_by_user_id,
    created_at
)
SELECT
    company || ' interview update',
    'Recruiter communication seed record for branch-wise, status-wise, and shortlisted-candidate messaging tests.',
    'Recruiter Update',
    company,
    'https://meet.example.com/' || lower(company),
    user_id,
    NOW() - ((row_number() OVER (ORDER BY company)) * INTERVAL '2 hours')
FROM (
    SELECT
        u.user_id,
        CASE
            WHEN u.email = 'recruiter@infosys.com' THEN 'Infosys'
            WHEN u.email = 'recruiter@tcs.com' THEN 'TCS'
            WHEN u.email = 'recruiter@wipro.com' THEN 'Wipro'
            WHEN u.email = 'recruiter@accenture.com' THEN 'Accenture'
            WHEN u.email = 'recruiter@cognizant.com' THEN 'Cognizant'
            WHEN u.email = 'recruiter@deloitte.com' THEN 'Deloitte'
            WHEN u.email = 'recruiter@capgemini.com' THEN 'Capgemini'
        END AS company
    FROM users u
    WHERE u.role = 'RECRUITER'
) recruiter_updates;

COMMIT;

SELECT 'users' AS table_name, count(*) FROM users
UNION ALL SELECT 'students', count(*) FROM students
UNION ALL SELECT 'student_documents', count(*) FROM student_documents
UNION ALL SELECT 'opportunities', count(*) FROM opportunities
UNION ALL SELECT 'applications', count(*) FROM applications
UNION ALL SELECT 'portal_updates', count(*) FROM portal_updates
ORDER BY table_name;
