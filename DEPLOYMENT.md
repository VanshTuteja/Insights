# AI Interview Prep – Deployment Guide

## Architecture

- **Frontend**: React (Vite) + Tailwind + shadcn/ui → **Vercel** or **Netlify**
- **Backend**: Node.js + Express → **Render** or **Railway**
- **Whisper**: Python FastAPI → **Docker** (Render/Railway/Fly.io)
- **AI**: **Groq API** (Llama-3 / Mixtral)
- **Database**: **MongoDB** (Atlas or provider of choice)

## 1. Environment variables

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
FRONTEND_URL=https://your-app.vercel.app
GROQ_API_KEY=gsk_...          # From console.groq.com
GROQ_MODEL=llama-3.1-8b-instant
WHISPER_SERVICE_URL=https://your-whisper-service.onrender.com
```

### Frontend (`client/.env`)

```env
VITE_API_URL=https://your-api.onrender.com/api
```

### Whisper service

```env
WHISPER_MODEL=base
```

## 2. Database

1. Create a MongoDB database (e.g. MongoDB Atlas).
2. Set `MONGODB_URI` in the backend.
3. Seed interview questions (from repo root):

```bash
cd server
npx ts-node src/scripts/seedInterviewQuestions.ts
```

## 3. Backend (Render / Railway)

- **Build**: `npm install && npm run build`
- **Start**: `npm start`
- **Root**: `server/`
- Add env vars above; ensure `FRONTEND_URL` matches the frontend URL for CORS.

## 4. Whisper service (Docker)

From project root:

```bash
cd services/whisper
docker build -t whisper-api .
docker run -p 8000:8000 -e WHISPER_MODEL=base whisper-api
```

For Render/Railway:

- Use a **Docker** deploy with the Dockerfile in `services/whisper/`.
- Set `WHISPER_SERVICE_URL` in the Node backend to this service’s public URL.
- Optional: use a larger model (`medium`) by setting `WHISPER_MODEL` (slower, more accurate).

## 5. Frontend (Vercel / Netlify)

- **Build**: `npm run build`
- **Root**: `client/`
- **Output**: `dist/`
- Set `VITE_API_URL` to your backend API base URL (e.g. `https://your-api.onrender.com/api`).

## 6. Groq

1. Get an API key from [console.groq.com](https://console.groq.com).
2. Set `GROQ_API_KEY` (and optionally `GROQ_MODEL`) in the backend.
3. If the key is missing or the API fails, the app uses the **fallback evaluation** (predefined responses) so interviews still work.

## 7. Optional: face/emotion detection

The UI sends a placeholder **confidence** score. To add real detection:

- Use **MediaPipe** or **face-api.js** in the client to analyze the camera feed.
- Send the resulting metrics in `confidenceMetrics` when calling `upload-response`.
- No backend changes required.

## 8. Quick local run

```bash
# Terminal 1 – Whisper (optional; without it, transcript is empty and fallback evaluation is used)
cd services/whisper && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# Terminal 2 – Backend
cd server && npm install && npm run dev

# Terminal 3 – Frontend
cd client && npm install && npm run dev
```

Then open the app, log in, go to Interview Prep, pick a category, and run through an interview.
