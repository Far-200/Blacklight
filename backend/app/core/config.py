"""
Central settings for the Blacklight orchestrator backend.
Pulled from environment variables so nothing sensitive is hardcoded.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Database / Queue ---
    database_url: str = "postgresql+asyncpg://blacklight:blacklight@localhost:5432/blacklight"
    redis_url: str = "redis://localhost:6379/0"

    # --- App ---
    environment: str = "development"
    app_secret_key: str = "change-me-in-.env"

    # --- Scope Gate ---
    # Prefix used for DNS TXT domain-ownership challenges, e.g. _blacklight-verify.example.com
    dns_txt_challenge_prefix: str = "_blacklight-verify"
    # Well-known path used for file-based domain-ownership challenges
    file_challenge_path: str = "/.well-known/blacklight-verify.txt"
    # How long an unverified challenge token is valid for, in hours
    challenge_token_ttl_hours: int = 24
    # How long a passing authorization record remains valid before re-verification, in days
    authorization_validity_days: int = 30


settings = Settings()
