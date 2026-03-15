# API Documentation (Part 1 – Auth & foundation)

## Folder structure

```
server/
├── src/
│   ├── config/         # App config (env, jwt, db, cors)
│   ├── controllers/    # Route handlers (auth, jobs, applications, interviews)
│   ├── database/      # MongoDB connection
│   ├── middleware/    # auth.ts (authenticateToken, requireRole), validation
│   ├── models/        # User, Job, Application, Interview
│   ├── routes/        # auth, jobs, applications, interviews
│   ├── seed/          # seed.ts – example users, jobs, applications, interviews
│   ├── types/         # Shared TypeScript types
│   ├── utils/         # logger, email, etc.
│   └── server.ts      # Express app entry
├── .env.example
├── API.md             # This file
└── package.json
```

## Authentication

Base path: `/api/auth`

### POST /auth/signup

Create a new account. Role is stored in the database.

**Body (JSON):**

| Field    | Type   | Required | Description                          |
|----------|--------|----------|--------------------------------------|
| name     | string | Yes      | Full name                            |
| email    | string | Yes      | Valid email                          |
| password | string | Yes      | Min 6 characters                     |
| role     | string | No       | `"jobseeker"` or `"employer"`. Default: `"jobseeker"` |

**Example:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "employer"
}
```

**Response:** `200` – `{ "success": true, "message": "OTP sent successfully" }`  
(Current flow sends OTP for email verification; after verification the user can log in.)

### POST /auth/login

**Body:**

| Field    | Type   | Required |
|----------|--------|----------|
| email    | string | Yes      |
| password | string | Yes      |

**Response:** `200` – `{ "success": true, "data": { "user": { ..., "role": "jobseeker" | "employer" }, "token": "..." } }`

The client should use the returned **role** to redirect:
- `role === "jobseeker"` → Job Seeker Dashboard  
- `role === "employer"` → Employer Dashboard  

### GET /auth/me

Requires `Authorization: Bearer <token>` (or cookie `token`).

**Response:** `200` – `{ "success": true, "data": <user object with role> }`

---

## Role middleware

- **authenticateToken** – Verifies JWT and sets `req.user` (`userId`, `email`, `role`).
- **requireRole("jobseeker")** or **requireRole("employer")** – Use after `authenticateToken` to restrict a route to one or more roles.

Example (in a route file):

```ts
router.get('/candidate-only', authenticateToken, requireRole('jobseeker'), handler);
router.get('/employer-only', authenticateToken, requireRole('employer'), handler);
```

---

## Database models (Part 1)

| Model        | Purpose |
|-------------|---------|
| **User**    | name, email, passwordHash, **role** (`jobseeker` \| `employer` \| `admin`), isVerified, profile fields, timestamps |
| **Job**     | title, company, location, salary, type, description, requirements, benefits, tags, employerId, views, isActive, timestamps |
| **Application** | jobId, candidateId, **status** (Applied \| Under Review \| Shortlisted \| Interview Scheduled \| Rejected \| Hired), resume, coverLetter, timestamps |
| **Interview**   | jobId, candidateId, interviewerId, employerId, scheduledAt, duration, type, status, meetingLink, notes, timestamps |

---

## Seed data

Run:

```bash
cd server && npm run seed
```

This creates:

- **Job Seeker:** `alex@example.com` / `password123` (role: jobseeker)  
- **Employer:** `jane@company.com` / `password123` (role: employer)  
- Two jobs (Tech Corp)  
- Two applications (job seeker applied to both jobs)  
- One scheduled interview (video, 7 days from seed run)  

Use these accounts to test login and role-based redirects.

---

## Jobs API (Part 2)

Base path: `/api/jobs`

### GET /jobs (public)

List active jobs with filters and pagination.

**Query:**

| Param   | Type   | Description |
|--------|--------|-------------|
| page   | number | Default 1   |
| limit  | number | Default 10  |
| search | string | Text search (title, description, tags) |
| location | string | Location regex (case-insensitive) |
| type   | string | `full-time`, `part-time`, `contract`, `remote`, `hybrid` |
| salary | string | Regex on salary string (e.g. `100k`, `120`) |
| tags   | string | Comma-separated (e.g. `React,TypeScript`) |

**Response:** `200` – `{ "success": true, "data": { "jobs": [...], "pagination": { "page", "limit", "total", "pages" } } }`

### GET /jobs/:id (public)

Job by ID. Increments view count.

**Response:** `200` – `{ "success": true, "data": <job with employerId populated> }`

### POST /jobs/create (employer)

Create a job. Also: `POST /jobs` (same body).

**Headers:** `Authorization: Bearer <token>`

**Body:** `title`, `company`, `description`, `location`, `salary`, `type`, `requirements`, `benefits`, `tags` (array of strings).

**Response:** `201` – `{ "success": true, "data": <job>, "message": "Job created successfully" }`

### GET /jobs/employer (employer)

List jobs posted by the current employer.

**Response:** `200` – `{ "success": true, "data": [<jobs>] }`

### PUT /jobs/update/:id (employer)

Update job. Also: `PUT /jobs/:id`.

**Body:** Same fields as create (partial update).

**Response:** `200` – `{ "success": true, "data": <job>, "message": "Job updated successfully" }`

### DELETE /jobs/delete/:id (employer)

Delete a job. Also: `DELETE /jobs/:id`.

**Response:** `200` – `{ "success": true, "message": "Job deleted successfully" }`

### Job seeker only

- `POST /jobs/:id/apply` – Apply to job (body: `coverLetter`, `resume`). Use **POST /applications/apply** with `jobId` in body instead for consistent Application statuses.
- `POST /jobs/:id/save` – Toggle saved job.
- `GET /jobs/saved/list` – List saved jobs.

---

## Applications API (Part 2)

Base path: `/api/applications`

All routes require `Authorization: Bearer <token>`.

### POST /applications/apply (job seeker)

Apply to a job. Creates an Application with status `Applied`.

**Body:**

| Field      | Type   | Required |
|------------|--------|----------|
| jobId      | string | Yes      |
| coverLetter| string | No       |
| resume    | string | No       |

**Response:** `201` – `{ "success": true, "data": <application>, "message": "Application submitted successfully" }`

### GET /applications/candidate (job seeker)

List current user's applications with job details and interview date/link when scheduled.

**Response:** `200` – `{ "success": true, "data": [{ "_id", "jobId", "status", "resume", "coverLetter", "appliedDate", "interviewDate", "meetingLink", "interviewType" }, ...] }`

Statuses: `Applied`, `Under Review`, `Shortlisted`, `Interview Scheduled`, `Rejected`, `Hired`.

### GET /applications/job/:jobId (employer)

List applicants for a job. Only the job owner can call this.

**Response:** `200` – `{ "success": true, "data": [{ "_id", "candidate", "status", "resume", "coverLetter", "appliedAt", "interviewDate", "meetingLink" }, ...] }`

### GET /applications/employer (employer)

List all applications for the employer's jobs (all jobs they posted).

**Response:** `200` – `{ "success": true, "data": [{ "_id", "jobId", "jobTitle", "company", "candidate", "status", "resume", "appliedAt" }, ...] }`

### PATCH /applications/:id/status (employer)

Update application status. Only the job owner can update.

**Body:** `{ "status": "Under Review" | "Shortlisted" | "Interview Scheduled" | "Rejected" | "Hired" }`

**Response:** `200` – `{ "success": true, "data": <application>, "message": "Application status updated" }`

Note: When the employer schedules an interview via **POST /interviews/schedule**, the corresponding application status is automatically set to `Interview Scheduled`.

---

## Interviews API (Part 2)

Base path: `/api/interviews`

All routes require `Authorization: Bearer <token>`.

### POST /interviews/schedule (employer)

Schedule an interview. Sets the related application status to `Interview Scheduled`.

**Body:**

| Field       | Type   | Required |
|-------------|--------|----------|
| jobId      | string | Yes      |
| candidateId| string | Yes      |
| date       | string | Yes (e.g. `2025-03-15`) |
| time       | string | Yes (e.g. `14:00`)     |
| type       | string | Yes (`video` \| `phone` \| `onsite` → in-person) |
| meetingLink| string | No       |
| notes      | string | No       |

**Response:** `201` – `{ "success": true, "data": <interview populated>, "message": "Interview scheduled successfully" }`

### GET /interviews/candidate (job seeker)

List interviews for the current candidate.

**Response:** `200` – `{ "success": true, "data": [<interview with jobId, interviewerId populated>] }`

### GET /interviews/employer (employer)

List interviews scheduled by the current employer.

**Response:** `200` – `{ "success": true, "data": [<interview with jobId, candidateId populated>] }`

### PATCH /interviews/:id (employer)

Update interview: cancel, reschedule, or set completed. Only the interviewer/employer can update.

**Body (all optional):** `status`, `date`, `time`, `meetingLink`, `notes`.

**Response:** `200` – `{ "success": true, "data": <interview>, "message": "Interview updated" }`

---

## Data flow (Part 2)

1. **Employer posts job** → `POST /jobs/create` → Job appears in **Find Jobs** (`GET /jobs`).
2. **Job seeker applies** → `POST /applications/apply` → Application appears in **Employer Applicants** (`GET /applications/job/:jobId` or `GET /applications/employer`).
3. **Employer schedules interview** → `POST /interviews/schedule` → Application status set to `Interview Scheduled`; interview appears in **My Interviews** (`GET /interviews/candidate`).
4. **Application status updates** → `PATCH /applications/:id/status` or scheduling interview → Status appears in **My Applications** (`GET /applications/candidate`).
