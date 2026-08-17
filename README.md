# CivicConnect AI — Complete Civic Platform

> **"Report Problems. Build Support. Track Change."**

**CivicConnect AI** is a production-ready, secure, and multilingual civic technology platform connecting **Citizens**, **Municipal Corporations (BBMP)**, and **Field Workers** to resolve urban infrastructure challenges with transparency and efficiency.

---

## 1. Domain Architecture: Three Integrated Actors

```
[ CITIZEN ACTOR ]
  - Submits unstructured complaint in English, Kannada, or Hindi
  - AI parses category, safety hazards, accidents, duration, and landmarks
  - Checks similarity against existing locality issues (Prevent duplicate records)
  - Citizen supports existing issue OR submits new consolidated civic issue
  - Tracks live progress and reads simplified official statements

          ↓ (FastAPI Backend + Deterministic Urgency Engine)

[ MUNICIPAL CORPORATION ACTOR ]
  - Priority triage dashboard ordered by deterministic 0-100 civic urgency score
  - Consolidates citizen reports and evidence photo galleries
  - Assigns issues to specialized field crews (Roads, Drainage, Electricity, etc.)
  - Posts public municipal statements and updates status milestones
  - Analyzes ward-level performance and worker workload distribution

          ↓ (Field Assignment)

[ FIELD WORKER ACTOR ]
  - Mobile-first crew dashboard with assigned work queues
  - Records on-site inspection logs and estimated repair timeframes
  - Submits live progress reports and uploads before/during/after photo evidence
  - Marks tasks resolved upon completion
```

---

## 2. Technical Stack

- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS Design System with 3D Depth Tokens, Lucide Icons, Full i18n Localization (English, Kannada, Hindi).
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Groq Cloud AI (`llama-3.3-70b-versatile`), Token-based Supabase JWT & RBAC Authorization.
- **Database & Storage**: Supabase PostgreSQL with 17 normalized entities, Row Level Security (RLS) policies, automatic database triggers, and `evidence-files` storage bucket.

---

## 3. Project Structure

```
Ethnotech_Internship/
├── database/
│   ├── schema.sql           # Complete PostgreSQL schema (tables, RLS, triggers, storage)
│   ├── seed.sql             # Reference baseline data for local/staging verification
│   └── README.md            # Supabase database & storage setup instructions
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application entrypoint & middleware
│   │   ├── auth.py          # JWT validation & Role-Based Access Control (RBAC)
│   │   ├── config.py        # Environment settings (Pydantic BaseSettings)
│   │   ├── database.py      # Supabase Client connection manager
│   │   ├── models/          # Schemas for AI, Issues, Complaints, Workers, Stats, Profiles
│   │   ├── prompts/         # Fact-grounded prompt templates for Groq AI
│   │   ├── services/        # AI, Priority, Corroboration, Similarity, & Supabase Services
│   │   └── routers/         # API endpoints (ai, issues, complaints, corporation, worker, etc.)
│   ├── tests/               # Pytest automated test suites (36 comprehensive tests)
│   ├── requirements.txt     # Python backend dependencies
│   └── .env.example         # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI, Layouts, Citizen, Corporation, Worker components
│   │   ├── context/         # AuthContext, LanguageContext, ToastContext
│   │   ├── lib/             # api.ts, supabase.ts, storage.ts, types.ts, i18n.ts
│   │   ├── pages/           # Portals for Citizen, Corporation, Worker, and Authentication
│   │   └── styles/          # index.css (Responsive design tokens, 3D depth system)
│   ├── package.json
│   └── .env.example
├── .env.example
├── README.md
└── start.ps1 / start.bat    # Automated startup scripts
```

---

## 4. Setup & Running Locally

### Step 1: Database (Supabase)
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and go to **SQL Editor**.
2. Run [`database/schema.sql`](./database/schema.sql) to create all tables, indexes, triggers, and RLS policies.
3. Verify that the **`evidence-files`** storage bucket exists with public read access.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in `backend/` and `frontend/`:

**`backend/.env`**:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

**`frontend/.env`**:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_publishable_key
VITE_API_BASE_URL=http://localhost:8000
```

### Step 3: Run the Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Step 4: Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
- App URL: `http://localhost:5173`

---

## 5. Verification & Testing

### Backend Test Suite (36 Automated Tests)
```bash
cd backend
python -m pytest
```
- Tests include:
  - Role-Based Access Control (RBAC) authorization enforcement
  - Citizen complaint submission & civic validity filtering
  - Semantic similarity search & deduplication
  - Deterministic 0-100 Priority Engine calculations
  - Community corroboration index calculations
  - End-to-end Citizen -> Corporation -> Worker -> Citizen lifecycle

### Frontend Production Build
```bash
cd frontend
npm run build
```
- Validates 100% strict TypeScript types and compiles optimized production assets.

---

## 6. Deploying to Vercel

CivicConnect AI is configured for instant deployment on [Vercel](https://vercel.com).

### Option A: Deploy Frontend on Vercel (Recommended)
1. In the Vercel Dashboard, click **New Project** and import your GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset will auto-detect as **Vite**.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `your_supabase_anon_key`
   - `VITE_API_BASE_URL`: `https://your-backend-api.com` (or your deployed FastAPI backend URL)
5. Click **Deploy**. Vercel will automatically handle client-side Single Page Application (SPA) routing via `frontend/vercel.json`.

### Option B: Deploy Fullstack (Root Repo) on Vercel
1. Import your root GitHub repository into Vercel.
2. Keep **Root Directory** as `./`.
3. In **Environment Variables**, add:
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_key`
   - `GROQ_API_KEY`: `gsk_your_groq_key`
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `your_supabase_anon_key`
4. Click **Deploy**. Root `vercel.json` will build the frontend assets and deploy the backend as a serverless Python API (`/api/*`).
