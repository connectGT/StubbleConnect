from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "StubbleConnect API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # Biomass logistics constants
    DBSCAN_EPS_KM: float = 8.0  # Cluster radius in km
    DBSCAN_MIN_SAMPLES: int = 3
    CRITICAL_WINDOW_HOURS: int = 48

    class Config:
        case_sensitive = True

settings = Settings()
