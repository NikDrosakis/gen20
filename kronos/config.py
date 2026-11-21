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
    MARIA: str  # MARIA is a simple string
    MARIADMIN: str  # MARIADMIN is also a simple string
    REDIS_URL: str
    REDIS_CHANNEL: str = None
    DEEPSEEK_API_KEY: str
    WEBSOCKET_URL: str

    class Config:
        env_file = ".env"

settings = Settings()
