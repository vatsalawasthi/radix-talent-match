import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import jd, resume, profile, talent_check, match, data
from services.mongo_service import init_mongo

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize MongoDB if configured
    init_mongo()
    yield

app = FastAPI(
    title="RADIX Talent Match — Integrated 5-Role Platform",
    description="End-to-end tool helping candidates understand role readiness across all 12 RADIX skillsets with MongoDB persistence.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://*.vercel.app",
        "https://*.onrender.com",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jd.router)
app.include_router(resume.router)
app.include_router(profile.router)
app.include_router(talent_check.router)
app.include_router(match.router)
app.include_router(data.router)

@app.get("/")
def root():
    return {
        "platform": "RADIX Talent Match Hackathon",
        "roles": {
            "01": "JD Analytics",
            "02": "Resume Parsing",
            "03": "Profile Builder",
            "04": "Talent Check",
            "05": "Skill Matching"
        },
        "database": "MongoDB / Local JSON Store",
        "docs": "/docs",
        "status": "healthy"
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "modules_active": [
            "01-JD-Analytics",
            "02-Resume-Parsing",
            "03-Profile-Builder",
            "04-Talent-Check",
            "05-Skill-Matching"
        ],
        "database_support": "MongoDB ready",
        "integrated_flow": "ready"
    }
