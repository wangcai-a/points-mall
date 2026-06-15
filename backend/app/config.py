from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    database_url: str = "sqlite:///./test.db"

    class Config:
        env_file = ".env"

settings = Settings()