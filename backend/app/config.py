import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Automatically discover and load .env from backend directory, parent workspace, or CWD
BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent

for candidate_env in [BACKEND_DIR / ".env", ROOT_DIR / ".env", Path(".env")]:
    if candidate_env.exists():
        load_dotenv(dotenv_path=candidate_env, override=False)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(BACKEND_DIR / ".env"), str(ROOT_DIR / ".env"), ".env"],
        extra="ignore"
    )

    APP_NAME: str = "CivicConnect AI Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Supabase configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", "")).strip().strip('"\'')
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip().strip('"\'')
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", os.getenv("VITE_SUPABASE_ANON_KEY", os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY", ""))).strip().strip('"\'')
    
    # Groq API configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip().strip('"\'')
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip().strip('"\'')
    
    # Server & CORS
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175"
    )

    @property
    def clean_supabase_url(self) -> str:
        url = self.SUPABASE_URL.rstrip("/")
        return url

    @property
    def effective_supabase_key(self) -> str:
        """Prefers service role key, falls back to anon key if service role is omitted."""
        return self.SUPABASE_SERVICE_ROLE_KEY or self.SUPABASE_ANON_KEY

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_supabase_credentials(self) -> bool:
        url = self.clean_supabase_url
        key = self.effective_supabase_key
        return bool(
            url and 
            key and 
            url.startswith("http") and 
            "your-project-id" not in url and
            "your_supabase_service_role" not in key and
            "placeholder" not in key
        )

    @property
    def is_supabase_configured(self) -> bool:
        if not self.has_supabase_credentials:
            return False
        try:
            from app.database import is_supabase_alive
            return is_supabase_alive()
        except Exception:
            return True

    @property
    def is_groq_configured(self) -> bool:
        key = self.GROQ_API_KEY
        return bool(
            key and 
            key.startswith("gsk_") and 
            "your_groq_api_key" not in key
        )

settings = Settings()
