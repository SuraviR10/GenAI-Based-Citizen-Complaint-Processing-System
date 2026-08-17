import logging
from typing import Optional, Dict, Any
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger("civicconnect.database")

_supabase_client: Optional[Client] = None

def get_supabase() -> Client:
    """
    Returns an authenticated Supabase client using the service role key.
    Raises ValueError if configuration is missing.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.is_supabase_configured:
        logger.warning(
            "Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not configured. "
            "Backend will safely use high-performance local memory store fallback."
        )
        raise ValueError(
            "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
        )

    try:
        _supabase_client = create_client(settings.clean_supabase_url, settings.SUPABASE_SERVICE_ROLE_KEY)
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise

def test_supabase_connection() -> Dict[str, Any]:
    """
    Tests live connection to Supabase database by attempting a lightweight query.
    Returns status details dictionary.
    """
    if not settings.is_supabase_configured:
        return {
            "status": "not_configured",
            "message": "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are empty or unconfigured in backend/.env."
        }

    try:
        client = get_supabase()
        # Ping civic_issues table
        res = client.table("civic_issues").select("id").limit(1).execute()
        return {
            "status": "connected",
            "message": "Successfully connected to Supabase database.",
            "url": settings.clean_supabase_url
        }
    except Exception as e:
        logger.error(f"Supabase connection test failed: {e}")
        return {
            "status": "error",
            "message": f"Connection attempt failed: {str(e)}",
            "url": settings.clean_supabase_url
        }
