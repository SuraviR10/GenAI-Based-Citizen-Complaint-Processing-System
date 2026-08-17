import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "CivicConnect AI Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Supabase configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip().strip('"\'')
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip().strip('"\'')
    
    # Groq API configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip().strip('"\'')
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip().strip('"\'')
    
    # Server & CORS
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    )

    @property
    def clean_supabase_url(self) -> str:
        url = self.SUPABASE_URL.rstrip("/")
        return url

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_supabase_configured(self) -> bool:
        url = self.clean_supabase_url
        key = self.SUPABASE_SERVICE_ROLE_KEY
        return bool(
            url and 
            key and 
            url.startswith("http") and 
            "your-project-id" not in url and
            "your_supabase_service_role" not in key
        )

    @property
    def is_groq_configured(self) -> bool:
        key = self.GROQ_API_KEY
        return bool(
            key and 
            key.startswith("gsk_") and 
            "your_groq_api_key" not in key
        )

settings = Settings()
