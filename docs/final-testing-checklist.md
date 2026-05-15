# PlacePro Final Testing Checklist

Use this checklist after running `database/005_final_testing_dataset.sql`.

## Test Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@test.com | admin123 |
| Recruiter | recruiter@infosys.com | recruiter123 |
| Recruiter | recruiter@tcs.com | recruiter123 |
| Student | student001@test.com | student123 |
| Student | student045@test.com | student123 |
| Student | student090@test.com | student123 |

## Seed Coverage

- 1 admin account.
- 7 recruiter accounts mapped to separate companies.
- 120 student accounts across CA, IT, CS, and CV.
- 720 student document records covering resume, Aadhaar, PAN, ABC ID, domicile certificate, and caste certificate.
- 42 company-owned job opportunities.
- 600+ realistic applications across Applied, Shortlisted, Interview Scheduled, Moved to Next Round, Selected, and Rejected.
- Recruiter communication/update records.

## Admin QA

- Login with `admin@test.com`.
- Open Student Data and search by enrollment. Typing should not refresh/reset the table after each character.
- Search by branch name and verify rows update in place.
- Open a student details page and verify credentials plus uploaded documents show.
- Preview PDF/image documents before downloading.
- Check tables, pagination, empty states, and mobile layout.

## Student QA

- Login with `student001@test.com`.
- Verify profile details persist after refresh.
- Upload valid PDF/JPG/PNG documents under 1 MB.
- Confirm Aadhaar, PAN, ABC ID, domicile, and caste certificate preview correctly.
- Try unsupported files and files over 1 MB. The UI should block them with a clear error.
- Apply for opportunities and verify resume preview does not crash on missing or invalid files.

## Recruiter QA

- Login with `recruiter@infosys.com`.
- Confirm only Infosys opportunities and Infosys applications are visible.
- Check Applied Records filters: enrollment, branch, CGPA, status, date, and resume uploaded.
- Open resume preview. It should not auto-download; download should be a separate button.
- Use Candidate Pipeline and verify all six stages have data.
- Move candidates between stages and add recruiter remarks.
- Use Interview Management filters by round/status and update interview details.
- Use Hiring Status to bulk review Selected, Rejected, On Hold, Final Selected, and Offer Sent.
- Use Communication Center filters for branch, enrollment, status, shortlisted, interview, and selected candidates.

## Role Privacy QA

- Login as `recruiter@infosys.com`; record an Infosys application count.
- Login as `recruiter@tcs.com`; verify Infosys opportunities/applications are not visible.
- Try changing the recruiter id in API URLs manually. The backend should return only data owned by that recruiter id.
- Login as a student and confirm recruiter/admin panels are not accessible from normal navigation.

## Validation Negative Cases

- Mobile: `+919876543210`, `919876543210`, `98765 43210`, `98765`.
- Enrollment: `0801ME251001`, `801CA251001`, `0801CA25A001`.
- Valid enrollment edge case: `0801CS251114`.
- Uploads: `.exe`, `.txt`, PDF over 1 MB, image over 1 MB.
- Duplicate registration email.
- Missing required fields in student profile and opportunity forms.

## UI/UX QA

- Test at desktop, laptop, tablet, and mobile widths.
- Verify navbar/sidebar alignment, sticky behavior, and no horizontal overflow.
- Check modals, preview windows, loading states, empty states, table headers, filter bars, and action buttons.
- Watch the browser console for JavaScript errors.

## Performance QA

- Open Admin Student Data with 120 students and confirm filtering is responsive.
- Open Recruiter Applied Records with seeded applications and confirm pagination/filtering is smooth.
- Confirm no repeated full-page re-render during search input.

## Release Notes

- Do not run the reset script against production.
- The seed uses plain passwords because the current local authentication flow compares raw strings.
- The dataset is deterministic, so QA bugs can be reproduced across Windows and macOS.
