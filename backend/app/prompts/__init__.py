import os
from functools import lru_cache

PROMPTS_DIR = os.path.dirname(os.path.abspath(__file__))

@lru_cache(maxsize=16)
def get_prompt(prompt_name: str) -> str:
    """
    Loads centralized system prompt template by name.
    Example: get_prompt('complaint_analysis')
    """
    filename = f"{prompt_name}.txt" if not prompt_name.endswith(".txt") else prompt_name
    file_path = os.path.join(PROMPTS_DIR, filename)
    
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    
    raise FileNotFoundError(f"Prompt template '{prompt_name}' not found at {file_path}")
