# RADIX Talent Match — 5-Module Candidate Readiness Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvatsalawasthi%2Fradix-talent-match&project-name=radix-talent-match&root-directory=frontend)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/vatsalawasthi/radix-talent-match)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-cyan.svg)](https://react.dev/)

An integrated, end-to-end full-stack platform built for the **RADIX Talent Match Hackathon**. Helps candidates understand exactly how ready they actually are for specific job postings across the official **12-skillset competency framework**.

---

## 🚀 Live Working Links & Access

- **Public GitHub Repository**: [https://github.com/vatsalawasthi/radix-talent-match](https://github.com/vatsalawasthi/radix-talent-match)
- **1-Click Deploy to Vercel (Frontend)**: [Deploy on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvatsalawasthi%2Fradix-talent-match&project-name=radix-talent-match&root-directory=frontend)
- **1-Click Deploy to Render (Backend & DB)**: [Deploy on Render](https://render.com/deploy?repo=https://github.com/vatsalawasthi/radix-talent-match)
- **FastAPI OpenAPI Interactive Admin Docs**: `/docs` or `/redoc`

---

## 🧩 The Five Core Modules

| Module | Role | Mission & Input | Output Contract |
| :--- | :--- | :--- | :--- |
| **01 JD Analytics** | Role 1 | Ingests PDF/Word/Text JD; extracts required skills across the 12 RADIX categories + named technologies with evidence quotes and confidence ratings. | Extracted JD skill list JSON |
| **02 Resume Parsing** | Role 2 | Ingests candidate resumes; extracts skills, education, internships, and candidate metadata. | Resume skill list + profile metadata |
| **03 Profile Builder** | Role 3 | Interactive candidate profile editor with live 12-category skill tagging, hackathons, and certifications. | Saved Candidate Profile JSON |
| **04 Talent Check** | Role 4 | One-button evaluation against company expected bar (Google, Microsoft, Oracle) across all 12 RADIX categories. | Readiness Score (0–100) + Radar Chart |
| **05 Skill Matching** | Role 5 | Direct job-posting fuzzy match with candidate proof, matched skills, and prioritized gap list. | Match Score (0–100) + Missing Skills Breakdown |

---

## ⚡ The Integrated 5-Step Pipeline (Page 12)

```
Pick a JD  ───►  Parse Resume  ───►  Build Profile  ───►  Run Talent Check  ───►  Run Skill Match
(Module 01)       (Module 02)         (Module 03)           (Module 04)             (Module 05)
```

Includes a **1-Click Auto-Demo Runner** that executes all five stages sequentially in seconds.

---

## 🍃 MongoDB Persistence Layer

The backend uses `pymongo` to persist:
- `candidates`: Candidate profiles with verified skill tags and experiences
- `jds`: Analyzed job descriptions
- `talent_checks`: Company benchmark evaluation runs
- `skill_matches`: Role-specific matching scores and gap breakdowns
- `milestones`: Hackathon definition of done progress

### One-Command MongoDB Seeding:
```bash
cd backend
python seed_mongodb.py "your_mongodb_connection_string"
```

---

## 🛠️ Local Setup

### 1. Backend (FastAPI + Python 3.11)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API Docs: `http://localhost:8000/docs`

### 2. Frontend (React 18 + Vite + Recharts)
```bash
cd frontend
npm install
npm run dev
```
Web App: `http://localhost:5173`

---

## 📄 License
MIT © 2026 Vatsal Awasthi. Built for RADIX Talent Match Hackathon.
