from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str
    PORT: int
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASS: str
    DB_URL: str
    DB_ADMINURL: str
    ENVIRONMENT: str
    LOG_LEVEL: str
    API_KEY: str
    DATABASE_SOLR_VIVALIBRO: str
    MARIA: str  # MARIA is a simple string
    MARIADMIN: str  # MARIADMIN is also a simple string
    REDIS_URL: str
    OPENAI_API_KEY: str
    GEMINI_API_KEY: str
    OPENAI_SECRET_KEY: str
    OPENAI_PROJECT_ID: str
    OPENAI_ORG_ID: str
    REDIS_CHANNEL: str = None
    CLAUDE_KEY: str
    CLAUDE_ADMINKEY: str
    GOOGLEAI_APIKEY: str
    DEEPSEEK_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
