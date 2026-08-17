import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import test_supabase_connection
from app.routers import ai, issues, complaints, stats, notifications, profile, citizens, corporation, worker, chatbot

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("civicconnect.main")

# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for CivicConnect AI — Intelligent Civic Engagement and Triage Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
cors_origins = settings.cors_origin_list
if "*" in cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Routers
app.include_router(ai.router)
app.include_router(issues.router)
app.include_router(complaints.router)
app.include_router(stats.router)
app.include_router(notifications.router)
app.include_router(profile.router)
app.include_router(citizens.router)
app.include_router(corporation.router)
app.include_router(worker.router)
app.include_router(chatbot.router)

@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
        "configuration": {
            "mode": "supabase_live" if settings.is_supabase_configured else "local_preview",
            "supabase_configured": settings.is_supabase_configured,
            "groq_configured": settings.is_groq_configured,
            "groq_model": settings.GROQ_MODEL
        }
    }

@app.get("/health")
async def health():
    db_check = test_supabase_connection() if settings.is_supabase_configured else {"status": "not_configured", "message": "Using local in-memory storage (Preview Mode)"}
    return {
        "status": "healthy",
        "mode": "supabase_live" if settings.is_supabase_configured else "local_preview",
        "supabase": "connected" if settings.is_supabase_configured and db_check.get("status") == "connected" else ("configured_error" if settings.is_supabase_configured else "not_configured"),
        "supabase_details": db_check,
        "groq": "configured" if settings.is_groq_configured else "not_configured"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
