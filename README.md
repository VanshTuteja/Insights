# JobFinder AI

AI-powered MERN job platform with resume analysis, resume builder, interview practice, employer hiring tools, and admin management.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Zustand, Framer Motion
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- AI services: Groq, Google Cloud TTS
- Media/storage: Cloudinary, Multer
- Deployment: Render

## Features

- AI-assisted resume upload, analysis, generation, and improvement
- Mock interview flow with question generation, voice playback, live transcript support, and final reports
- Job search, saved jobs, applications, and employer dashboards
- Notifications, profile management, and role-based access
- Mobile-focused interview fallbacks for typed answers and manual audio playback

## Project Structure

```text
client/   React + Vite frontend
server/   Express + TypeScript backend
services/ Optional supporting services
```

## Local Setup

### 1. Install dependencies

From the project root:

```bash
npm install
npm install --prefix client
```

### 2. Configure environment variables

Create:

- `server/.env`
- `client/.env`

Suggested backend variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jobfinder
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173

GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.1-8b-instant

GOOGLE_TTS_API_KEY=your_google_tts_key
GOOGLE_TTS_LANGUAGE=hi-IN
GOOGLE_TTS_VOICE=hi-IN-Wavenet-A

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_brevo_login
SMTP_PASS=your_brevo_smtp_key
FROM=your_verified_sender@example.com
FROM_NAME=JobFinder AI
```

Suggested frontend variables:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run the App

### Backend

From the repo root:

```bash
npm run dev
```

### Frontend

From the `client` folder:

```bash
npm run dev
```

Frontend default dev URL:

```text
http://localhost:5173
```

## Build for Production

From the repo root:

```bash
npm run build
npm start
```

## Render Deployment

Recommended Render web service settings:

- Build Command: `npm run build`
- Start Command: `npm start`

Important Render environment variables:

- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `GROQ_API_KEY`
- `GOOGLE_TTS_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Frontend deployment should use:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## Scripts

### Root

- `npm run dev` - run backend in development with nodemon
- `npm run build` - build frontend and compile backend
- `npm start` - start compiled backend

### Client

- `npm run dev` - start Vite dev server
- `npm run build` - build frontend
- `npm run preview` - preview production frontend build

## Notes

- Do not commit real `.env` files or secrets.
- For production avatar uploads, Cloudinary is recommended.
- Mobile interview behavior depends on browser support for media permissions and speech APIs, so typed-answer fallback is included for unsupported mobile browsers.

## License

This project is for academic and personal project use unless you define a separate license.
