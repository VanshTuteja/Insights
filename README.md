# AI Powered Job Finder

AI Powered Job Finder is a full-stack platform that connects employers and job seekers with profile-based matching, interview workflows, and productivity tools.

## Features

- Role-based authentication for job seekers and employers
- Employer job posting and candidate application tracking
- Job seeker profile management with preferences and skills
- Job match notifications based on skills and preferences
- Interview scheduling and interview prep modules
- Resume builder and career insight dashboards

## Tech Stack

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS
- Zustand for state management
- Axios for API communication

### Backend

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT authentication
- Express middleware for role and validation checks

### Additional Services

- Whisper Python microservice (speech-to-text)
- Groq API integration for AI interview support

## Repository Structure

```text
AI_Powered-Job-Finder/
|- client/                  # React frontend
|- server/                  # Express backend
|- services/whisper/        # Python Whisper service
|- uploads/                 # Uploaded assets
|- DEPLOYMENT.md            # Deployment guide
|- README.md                # Project documentation
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)
- Python 3.10+ (for Whisper service)

## Environment Variables

### Backend (server/.env)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<db>
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com

# Optional but recommended operational settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=2000

# Optional email settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM=
FROM_NAME=JobFinder AI

# Optional asset storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional job aggregation
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
ADZUNA_COUNTRY=in

# Optional translation / TTS support
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_TTS_LANGUAGE=hi-IN
GOOGLE_TTS_VOICE=hi-IN-Wavenet-A

# Optional AI integrations
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
WHISPER_SERVICE_URL=https://your-whisper-service-domain.com

# Admin seed credentials
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

### Frontend (client/.env)

```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Whisper Service (services/whisper/.env optional)

```env
WHISPER_MODEL=base
```

## Installation

From the project root:

```bash
cd server
npm install

cd ../client
npm install
```

For Whisper service:

```bash
cd ../services/whisper
pip install -r requirements.txt
```

## Running Locally

Open 3 terminals.

### 1) Start backend

```bash
cd server
npm run dev
```

### 2) Start frontend

```bash
cd client
npm run dev
```

### 3) Start Whisper service (optional)

```bash
cd services/whisper
uvicorn main:app --reload --port 8000
```

Frontend default: http://localhost:5173  
Backend default: http://localhost:5000

## Build Commands

### Backend

```bash
cd server
npm run build
npm start
```

### Frontend

```bash
cd client
npm run build
npm run preview
```

## Useful Scripts

### server/package.json

- npm run dev: start backend with nodemon
- npm run build: compile TypeScript
- npm start: run compiled server
- npm run clean: remove dist
- npm run seed: seed database data

### client/package.json

- npm run dev: start Vite dev server
- npm run build: type-check and production build
- npm run lint: run ESLint
- npm run preview: preview production build

## API Reference

See API details in:

- server/API.md

## Deployment

See production deployment instructions in:

- DEPLOYMENT.md

## Notes on Notifications

- Job match notifications are generated when an employer creates a job.
- Matching uses candidate settings (job alerts, preferences, skills).
- Notification APIs are available at /api/notifications.

## Troubleshooting

- If frontend cannot call backend, verify VITE_API_URL and backend CORS FRONTEND_URL.
- If notifications are missing, verify jobseeker preferences.notifications.jobAlerts is enabled.
- If login fails after refresh, check JWT secret and token persistence behavior.

## License

This project is for educational and development use.
