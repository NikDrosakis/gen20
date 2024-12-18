# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str
    PORT: int
    DB_HOST: str
    DB_PORT: int
    DB_USERNAME: str
    DB_PASS: str
    ENVIRONMENT: str
    LOG_LEVEL: str
    API_KEY: str
    DATABASE_SOLR_VIVALIBRO: str
    DATABASE_VIVALIBRO: str
    DATABASE_GPM: str
    REDIS_URL: str
    DB_URL: str
    OPENAI_API_KEY: str
    GEMINI_API_KEY: str
    OPENAI_SECRET_KEY: str
    OPENAI_PROJECT_ID: str
    OPENAI_ORG_ID: str


    class Config:
        env_file = ".env"

settings = Settings()
