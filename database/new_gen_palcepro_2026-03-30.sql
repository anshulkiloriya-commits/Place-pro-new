--
-- PostgreSQL database dump
--

\restrict yQLQuujtUNPlq1xLWGybSgveMJ2bSAHudZGeZtidbyGUYAguiL0aegdFFkS8VCD

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    admin_id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- Name: admin_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_admin_id_seq OWNER TO postgres;

--
-- Name: admin_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_admin_id_seq OWNED BY public.admin.admin_id;


--
-- Name: application; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application (
    application_id integer NOT NULL,
    s_id character varying(20) NOT NULL,
    job_id integer NOT NULL,
    apply_date date DEFAULT CURRENT_DATE,
    status character varying(50) DEFAULT 'pending'::character varying
);


ALTER TABLE public.application OWNER TO postgres;

--
-- Name: application_application_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_application_id_seq OWNER TO postgres;

--
-- Name: application_application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_application_id_seq OWNED BY public.application.application_id;


--
-- Name: certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificate (
    certificate_id integer NOT NULL,
    s_id character varying(20) NOT NULL,
    title character varying(50) NOT NULL,
    platform character varying(50) NOT NULL,
    certificate_file character varying(255) NOT NULL,
    start_date date,
    end_date date
);


ALTER TABLE public.certificate OWNER TO postgres;

--
-- Name: certificate_certificate_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certificate_certificate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificate_certificate_id_seq OWNER TO postgres;

--
-- Name: certificate_certificate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certificate_certificate_id_seq OWNED BY public.certificate.certificate_id;


--
-- Name: company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company (
    company_id integer NOT NULL,
    company_name character varying(100) NOT NULL,
    status character varying(100) DEFAULT 'active'::character varying
);


ALTER TABLE public.company OWNER TO postgres;

--
-- Name: company_company_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_company_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_company_id_seq OWNER TO postgres;

--
-- Name: company_company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_company_id_seq OWNED BY public.company.company_id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    document_id integer NOT NULL,
    s_id character varying(20) NOT NULL,
    document_type character varying(50) NOT NULL,
    upload_file character varying(255) NOT NULL
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: documents_document_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documents_document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_document_id_seq OWNER TO postgres;

--
-- Name: documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documents_document_id_seq OWNED BY public.documents.document_id;


--
-- Name: education; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.education (
    education_id integer NOT NULL,
    s_id character varying(20) NOT NULL,
    education_type character varying(50) NOT NULL,
    institute character varying(100) NOT NULL,
    passing_year integer NOT NULL,
    percentage numeric(5,2)
);


ALTER TABLE public.education OWNER TO postgres;

--
-- Name: education_education_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.education_education_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.education_education_id_seq OWNER TO postgres;

--
-- Name: education_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.education_education_id_seq OWNED BY public.education.education_id;


--
-- Name: internship; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internship (
    internship_id integer NOT NULL,
    s_id character varying(20) NOT NULL,
    role character varying(100) NOT NULL,
    organization character varying(100) NOT NULL,
    start_date date,
    end_date date,
    stipend numeric(8,2),
    internship_certificate character varying(250) NOT NULL
);


ALTER TABLE public.internship OWNER TO postgres;

--
-- Name: internship_internship_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.internship_internship_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.internship_internship_id_seq OWNER TO postgres;

--
-- Name: internship_internship_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.internship_internship_id_seq OWNED BY public.internship.internship_id;


--
-- Name: job; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job (
    job_id integer NOT NULL,
    company_id integer NOT NULL,
    role character varying(100) NOT NULL,
    location character varying(100) NOT NULL,
    package numeric(10,2),
    min_gpa numeric(4,2),
    post_date date DEFAULT CURRENT_DATE,
    last_date date NOT NULL,
    CONSTRAINT job_check CHECK ((last_date > post_date))
);


ALTER TABLE public.job OWNER TO postgres;

--
-- Name: job_job_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_job_id_seq OWNER TO postgres;

--
-- Name: job_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_job_id_seq OWNED BY public.job.job_id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    message character varying(500),
    "current_date" date DEFAULT CURRENT_DATE
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: notification_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_notification_id_seq OWNER TO postgres;

--
-- Name: notification_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_notification_id_seq OWNED BY public.notification.notification_id;


--
-- Name: recruiter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recruiter (
    recruiter_id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.recruiter OWNER TO postgres;

--
-- Name: recruiter_recruiter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recruiter_recruiter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recruiter_recruiter_id_seq OWNER TO postgres;

--
-- Name: recruiter_recruiter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recruiter_recruiter_id_seq OWNED BY public.recruiter.recruiter_id;


--
-- Name: student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student (
    s_id character varying(255) NOT NULL,
    user_id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    mother_name character varying(255) NOT NULL,
    father_name character varying(255) NOT NULL,
    dob date NOT NULL,
    gender character varying(255) NOT NULL,
    phone_no character varying(255),
    category character varying(255) NOT NULL,
    branch character varying(255),
    branch_discipline character varying(255) NOT NULL,
    aadhar_no character varying(255) NOT NULL,
    pan_no character varying(255) NOT NULL,
    email character varying(255),
    CONSTRAINT student_phone_no_check CHECK ((length((phone_no)::text) = 10))
);


ALTER TABLE public.student OWNER TO postgres;

--
-- Name: student_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_documents (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    document_type character varying(100) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    mime_type character varying(100),
    file_size_bytes bigint NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now(),
    CONSTRAINT student_documents_size_check CHECK ((file_size_bytes <= 1048576))
);


ALTER TABLE public.student_documents OWNER TO postgres;

--
-- Name: student_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_documents_id_seq OWNER TO postgres;

--
-- Name: student_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_documents_id_seq OWNED BY public.student_documents.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    enrollment_no character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    personal_email character varying(255),
    college_email character varying(255),
    mobile character varying(255),
    dob date,
    father_name character varying(255),
    father_mobile character varying(255),
    mother_name character varying(255),
    mother_mobile character varying(255),
    class_name character varying(255),
    section character varying(255),
    abc_id character varying(255),
    aadhar_no character varying(255),
    pan_no character varying(255),
    student_image character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT students_aadhar_check CHECK (((aadhar_no IS NULL) OR ((aadhar_no)::text ~ '^[0-9]{12}$'::text))),
    CONSTRAINT students_abc_id_check CHECK (((abc_id IS NULL) OR ((abc_id)::text ~ '^[0-9]{12}$'::text))),
    CONSTRAINT students_enrollment_check CHECK (((enrollment_no)::text ~ '^[0-9]{4}[A-Z]{2}[0-9]{6}$'::text)),
    CONSTRAINT students_father_mobile_check CHECK (((father_mobile IS NULL) OR ((father_mobile)::text ~ '^[0-9]{10}$'::text))),
    CONSTRAINT students_mobile_check CHECK (((mobile IS NULL) OR ((mobile)::text ~ '^[0-9]{10}$'::text))),
    CONSTRAINT students_mother_mobile_check CHECK (((mother_mobile IS NULL) OR ((mother_mobile)::text ~ '^[0-9]{10}$'::text))),
    CONSTRAINT students_pan_check CHECK (((pan_no IS NULL) OR ((pan_no)::text ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'::text)))
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    created_at date DEFAULT CURRENT_DATE,
    id bigint NOT NULL,
    name character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('STUDENT'::character varying)::text, ('ADMIN'::character varying)::text, ('RECRUITER'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: admin admin_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin ALTER COLUMN admin_id SET DEFAULT nextval('public.admin_admin_id_seq'::regclass);


--
-- Name: application application_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application ALTER COLUMN application_id SET DEFAULT nextval('public.application_application_id_seq'::regclass);


--
-- Name: certificate certificate_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate ALTER COLUMN certificate_id SET DEFAULT nextval('public.certificate_certificate_id_seq'::regclass);


--
-- Name: company company_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company ALTER COLUMN company_id SET DEFAULT nextval('public.company_company_id_seq'::regclass);


--
-- Name: documents document_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents ALTER COLUMN document_id SET DEFAULT nextval('public.documents_document_id_seq'::regclass);


--
-- Name: education education_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.education ALTER COLUMN education_id SET DEFAULT nextval('public.education_education_id_seq'::regclass);


--
-- Name: internship internship_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internship ALTER COLUMN internship_id SET DEFAULT nextval('public.internship_internship_id_seq'::regclass);


--
-- Name: job job_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job ALTER COLUMN job_id SET DEFAULT nextval('public.job_job_id_seq'::regclass);


--
-- Name: notification notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification ALTER COLUMN notification_id SET DEFAULT nextval('public.notification_notification_id_seq'::regclass);


--
-- Name: recruiter recruiter_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiter ALTER COLUMN recruiter_id SET DEFAULT nextval('public.recruiter_recruiter_id_seq'::regclass);


--
-- Name: student_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents ALTER COLUMN id SET DEFAULT nextval('public.student_documents_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (admin_id, user_id, name) FROM stdin;
\.


--
-- Data for Name: application; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application (application_id, s_id, job_id, apply_date, status) FROM stdin;
\.


--
-- Data for Name: certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificate (certificate_id, s_id, title, platform, certificate_file, start_date, end_date) FROM stdin;
\.


--
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company (company_id, company_name, status) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (document_id, s_id, document_type, upload_file) FROM stdin;
\.


--
-- Data for Name: education; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.education (education_id, s_id, education_type, institute, passing_year, percentage) FROM stdin;
\.


--
-- Data for Name: internship; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.internship (internship_id, s_id, role, organization, start_date, end_date, stipend, internship_certificate) FROM stdin;
\.


--
-- Data for Name: job; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job (job_id, company_id, role, location, package, min_gpa, post_date, last_date) FROM stdin;
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (notification_id, user_id, message, "current_date") FROM stdin;
\.


--
-- Data for Name: recruiter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recruiter (recruiter_id, user_id, name) FROM stdin;
\.


--
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student (s_id, user_id, full_name, mother_name, father_name, dob, gender, phone_no, category, branch, branch_discipline, aadhar_no, pan_no, email) FROM stdin;
TEST1774811938234	10	Codex Test	Not Provided	Not Provided	2000-01-01	Not Provided	9999999999	Not Provided	\N	Not Provided	Not Provided	Not Provided	codex_student_1774811938234@example.com
\.


--
-- Data for Name: student_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_documents (id, student_id, document_type, file_name, file_path, mime_type, file_size_bytes, uploaded_at) FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, user_id, enrollment_no, full_name, personal_email, college_email, mobile, dob, father_name, father_mobile, mother_name, mother_mobile, class_name, section, abc_id, aadhar_no, pan_no, student_image, created_at, updated_at) FROM stdin;
1	17	0801CA251022	Profile User	profile_1774814567212@example.com	profile_1774814567212@example.com	9876543210	2003-05-15	Father Name	9876543211	Mother Name	9876543212	BCA	A	123456789012	123456789012	ABCDE1234F	\N	2026-03-30 01:32:48.878083	2026-03-30 01:32:48.878083
2	19	0801CA251023	Verify User	verify_1774814781599@example.com	verify_1774814781599@example.com	9876543210	2003-05-15	Father Name	9876543211	Mother Name	9876543212	BCA	A	123456789012	123456789012	ABCDE1234F	\N	2026-03-30 01:36:24.264955	2026-03-30 01:36:24.264955
3	20	0801CA251024	Live Check	livecheck_1774815678768@example.com	livecheck_1774815678768@example.com	9876543210	2003-05-15	Father Name	9876543211	Mother Name	9876543212	BCA	A	123456789012	123456789012	ABCDE1234F	\N	2026-03-30 01:51:19.454022	2026-03-30 01:51:19.454022
4	21	0801CA251039	Err Check	errcheck_1774816218128@example.com	errcheck_1774816218128@example.com	1234567899	2003-05-15	Father Name	9876543211	Mother Name	9876598765	BCA	A	123456789123	123412341234	ABCDE1234F	\N	2026-03-30 02:00:18.808226	2026-03-30 02:00:18.808226
5	14	0801CA251029	yash	yash123@gmail.com	yash@gmail.com	1234567899	2026-03-17	SAM	1234512345	SAM	9876598765	MCA	A	123456789123	123412341234	ABCDE1234F	\N	2026-03-30 02:03:22.410785	2026-03-30 02:03:22.410785
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password, role, created_at, id, name) FROM stdin;
7	codex_1774811713347@example.com	test123	STUDENT	2026-03-30	7	Codex Test
9	codex_1774811806003@example.com	test123	STUDENT	2026-03-30	9	Codex Test
8	codex_student_1774811806003@example.com	test123	STUDENT	2026-03-30	8	Linked User
10	codex_student_1774811938234@example.com	test123	STUDENT	2026-03-30	10	Linked User
11	codex_1774811938153@example.com	test123	STUDENT	2026-03-30	11	Codex Test
12	student@gmail.com	1234	STUDENT	2026-03-30	12	Anshul Kiloriya
13	raj@gmail.com	54321	STUDENT	2026-03-30	13	raj
14	yash@gmail.com	909090	STUDENT	2026-03-30	14	yash
15	profile_save_probe_1774813259954@example.com	test123	STUDENT	2026-03-30	15	Probe User
17	profile_1774814567212@example.com	test123	STUDENT	2026-03-30	17	Profile User
16	schema_1774814567161@example.com	test123	STUDENT	2026-03-30	16	Schema User
19	verify_1774814781599@example.com	test123	STUDENT	2026-03-30	19	Verify User
18	final_1774814781573@example.com	test123	STUDENT	2026-03-30	18	Final User
20	livecheck_1774815678768@example.com	test123	STUDENT	2026-03-30	20	Live Check
21	errcheck_1774816218128@example.com	test123	STUDENT	2026-03-30	21	Err Check
\.


--
-- Name: admin_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_admin_id_seq', 1, false);


--
-- Name: application_application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_application_id_seq', 1, false);


--
-- Name: certificate_certificate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.certificate_certificate_id_seq', 1, false);


--
-- Name: company_company_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_company_id_seq', 1, false);


--
-- Name: documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_document_id_seq', 1, false);


--
-- Name: education_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.education_education_id_seq', 1, false);


--
-- Name: internship_internship_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.internship_internship_id_seq', 1, false);


--
-- Name: job_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_job_id_seq', 1, false);


--
-- Name: notification_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_notification_id_seq', 1, false);


--
-- Name: recruiter_recruiter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recruiter_recruiter_id_seq', 1, false);


--
-- Name: student_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_documents_id_seq', 1, false);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 21, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 21, true);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (admin_id);


--
-- Name: admin admin_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_user_id_key UNIQUE (user_id);


--
-- Name: application application_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_pkey PRIMARY KEY (application_id);


--
-- Name: application application_s_id_job_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_s_id_job_id_key UNIQUE (s_id, job_id);


--
-- Name: certificate certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT certificate_pkey PRIMARY KEY (certificate_id);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (company_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


--
-- Name: education education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_pkey PRIMARY KEY (education_id);


--
-- Name: internship internship_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internship
    ADD CONSTRAINT internship_pkey PRIMARY KEY (internship_id);


--
-- Name: job job_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (job_id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (notification_id);


--
-- Name: recruiter recruiter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiter
    ADD CONSTRAINT recruiter_pkey PRIMARY KEY (recruiter_id);


--
-- Name: recruiter recruiter_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiter
    ADD CONSTRAINT recruiter_user_id_key UNIQUE (user_id);


--
-- Name: student student_aadhar_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_aadhar_no_key UNIQUE (aadhar_no);


--
-- Name: student_documents student_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_pkey PRIMARY KEY (id);


--
-- Name: student student_pan_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pan_no_key UNIQUE (pan_no);


--
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (s_id);


--
-- Name: student student_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_user_id_key UNIQUE (user_id);


--
-- Name: students students_enrollment_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_enrollment_no_key UNIQUE (enrollment_no);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_student_documents_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_documents_student_id ON public.student_documents USING btree (student_id);


--
-- Name: idx_student_documents_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_documents_type ON public.student_documents USING btree (document_type);


--
-- Name: idx_students_college_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_students_college_email ON public.students USING btree (college_email);


--
-- Name: idx_students_enrollment_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_students_enrollment_no ON public.students USING btree (enrollment_no);


--
-- Name: idx_students_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_students_user_id ON public.students USING btree (user_id);


--
-- Name: admin admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: application application_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job(job_id);


--
-- Name: application application_s_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_s_id_fkey FOREIGN KEY (s_id) REFERENCES public.student(s_id) ON DELETE CASCADE;


--
-- Name: certificate certificate_s_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT certificate_s_id_fkey FOREIGN KEY (s_id) REFERENCES public.student(s_id) ON DELETE CASCADE;


--
-- Name: documents documents_s_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_s_id_fkey FOREIGN KEY (s_id) REFERENCES public.student(s_id) ON DELETE CASCADE;


--
-- Name: education education_s_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_s_id_fkey FOREIGN KEY (s_id) REFERENCES public.student(s_id) ON DELETE CASCADE;


--
-- Name: internship internship_s_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internship
    ADD CONSTRAINT internship_s_id_fkey FOREIGN KEY (s_id) REFERENCES public.student(s_id) ON DELETE CASCADE;


--
-- Name: job job_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(company_id);


--
-- Name: notification notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: recruiter recruiter_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiter
    ADD CONSTRAINT recruiter_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: student_documents student_documents_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: student student_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict yQLQuujtUNPlq1xLWGybSgveMJ2bSAHudZGeZtidbyGUYAguiL0aegdFFkS8VCD

