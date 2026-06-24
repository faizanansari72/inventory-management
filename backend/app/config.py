import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration loaded from environment variables."""

    # Build a SQLAlchemy URL from a single DATABASE_URL, or from discrete parts.
    DATABASE_URL = os.environ.get("DATABASE_URL")

    if DATABASE_URL:
        # Some platforms (Render/Heroku) provide "postgres://"; SQLAlchemy needs "postgresql://".
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        user = os.environ.get("POSTGRES_USER", "postgres")
        password = os.environ.get("POSTGRES_PASSWORD", "postgres")
        host = os.environ.get("POSTGRES_HOST", "localhost")
        port = os.environ.get("POSTGRES_PORT", "5432")
        db = os.environ.get("POSTGRES_DB", "inventory")
        SQLALCHEMY_DATABASE_URI = f"postgresql://{user}:{password}@{host}:{port}/{db}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")

    # Comma-separated list of allowed origins for CORS, or "*" for all.
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
