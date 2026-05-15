# PlacePro - Student Placement & Recruitment Management System

PlacePro is a campus placement portal with Student, Admin, and Recruiter panels. The frontend is static HTML/CSS/JS and the backend is Spring Boot with PostgreSQL.

## Requirements

- Java 17
- PostgreSQL
- Python 3, for serving the static frontend
- Git

## Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE new_gen_palcepro;
```

Run the SQL files in `database/` in order if you are setting up a fresh database:

```text
001_placepro_schema.sql
002_drop_legacy_student.sql
003_expand_resume_storage.sql
004_recruiter_workflow_columns.sql
```

The backend also uses `spring.jpa.hibernate.ddl-auto=update`, so missing columns are created automatically during development.

## Backend Setup

The committed `application.yml` reads database settings from environment variables. Defaults are:

```text
DB_URL=jdbc:postgresql://localhost:5432/new_gen_palcepro
DB_USERNAME=postgres
DB_PASSWORD=postgres
SERVER_PORT=8080
```

### Windows PowerShell

```powershell
cd backend\placePro
$env:DB_PASSWORD="your_postgres_password"
.\mvnw.cmd spring-boot:run
```

### macOS/Linux

```bash
cd backend/placePro
export DB_PASSWORD="your_postgres_password"
./mvnw spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

## Frontend Setup

Open a second terminal.

### Windows PowerShell

```powershell
cd frontend
python -m http.server 5501
```

### macOS/Linux

```bash
cd frontend
python3 -m http.server 5501
```

Open:

```text
http://localhost:5501/pages/login.html
```

## Useful Test Accounts

Create users from the signup page, or register with the backend API. Example recruiter/admin accounts used in local testing:

```text
Admin
Email: admin@placepro.com
Password: admin123

Recruiter
Email: recruiter@placepro.com
Password: recruiter123
```

## Validation Rules

- Mobile numbers must be exactly 10 digits, without country code.
- Enrollment numbers must follow `0801CA251001` format.
- Allowed departments: `CA`, `IT`, `CS`, `CV`.
- Student documents accept PDF/JPG/JPEG/PNG under 1 MB.
- Resume uploads accept PDF/DOC/DOCX/JPG/PNG under 1 MB.

## Notes

- `backend/placePro/src/main/resources/application.properties` is intentionally ignored because it may contain local credentials.
- Use environment variables or create your own local `application.properties` if needed.
- Frontend API base defaults to `http://localhost:8080` in `frontend/js/api.js`.
