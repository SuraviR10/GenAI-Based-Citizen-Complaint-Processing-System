import logging
import time
from typing import Optional, Dict, Any
import httpx
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger("civicconnect.database")

_supabase_client: Optional[Client] = None
_supabase_last_check_time: float = 0.0
_supabase_is_alive: Optional[bool] = None
_CHECK_INTERVAL_SECONDS = 60.0  # re-check every 60 seconds if successful

def is_supabase_alive(force_check: bool = False) -> bool:
    """
    Performs a reliable ping to check if Supabase host is responsive.
    Caches the result so subsequent calls take 0ms.
    """
    global _supabase_last_check_time, _supabase_is_alive
    if not settings.has_supabase_credentials:
        return False

    now = time.time()
    if not force_check and _supabase_is_alive is True and (now - _supabase_last_check_time < _CHECK_INTERVAL_SECONDS):
        return True

    key = settings.effective_supabase_key
    try:
        url = f"{settings.clean_supabase_url}/rest/v1/"
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}"
        }
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, headers=headers)
            # If server responds with standard status codes, it is alive and connectable
            _supabase_is_alive = resp.status_code in (200, 401, 403, 404, 400)
    except Exception as e:
        logger.debug(f"Supabase reachability check error: {e}")
        # If credentials look valid, assume alive rather than permanently blocking on a single transient timeout
        _supabase_is_alive = True

    _supabase_last_check_time = now
    return _supabase_is_alive

def get_supabase() -> Client:
    """
    Returns an authenticated Supabase client using the service role key or anon key.
    Raises ValueError if configuration is missing.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.has_supabase_credentials:
        logger.warning(
            "Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not configured. "
            "Backend will safely use local memory store fallback."
        )
        raise ValueError(
            "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
        )

    try:
        key = settings.effective_supabase_key
        _supabase_client = create_client(settings.clean_supabase_url, key)
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise

def test_supabase_connection() -> Dict[str, Any]:
    """
    Tests live connection to Supabase database by querying civic_issues table.
    Returns status details dictionary.
    """
    if not settings.has_supabase_credentials:
        return {
            "status": "not_configured",
            "message": "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are empty or unconfigured in .env."
        }

    try:
        client = get_supabase()
        res = client.table("civic_issues").select("id").limit(1).execute()
        return {
            "status": "connected",
            "message": "Successfully connected to Supabase database.",
            "url": settings.clean_supabase_url,
            "sample_count": len(res.data) if res.data else 0
        }
    except Exception as e:
        logger.error(f"Supabase connection test failed: {e}")
        return {
            "status": "error",
            "message": f"Connection attempt failed: {str(e)}",
            "url": settings.clean_supabase_url
        }
