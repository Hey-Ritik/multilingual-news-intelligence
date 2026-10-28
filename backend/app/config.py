from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    APP_NAME: str = "Multilingual News Intelligence"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Ingestion constraints
    MAX_TEXT_LENGTH_CHARS: int = 100_000
    MAX_PDF_SIZE_BYTES: int = 15 * 1024 * 1024  # 15MB
    REQUEST_TIMEOUT_SECONDS: int = 10
    MAX_REDIRECTS: int = 3
    MAX_RESPONSE_BYTES: int = 5 * 1024 * 1024  # 5MB

    # Discovery
    GOOGLE_NEWS_ENABLED: bool = True
    GDELT_ENABLED: bool = True
    MAX_SEARCH_RESULTS_PER_LANG: int = 6

    # Supported target languages
    SUPPORTED_LANGUAGES: List[str] = ["en", "hi", "kn", "te", "ta"]

    # Optional LLM
    LLM_PROVIDER_ENABLED: bool = False
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

