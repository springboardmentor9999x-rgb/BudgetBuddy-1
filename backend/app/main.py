from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine, Base

# ==========================================
# IMPORT MODELS
# ==========================================

from app.models.user import User
from app.models.profile import Profile
from app.models.income import Income
from app.models.expense import Expense
from app.models.budget import Budget


# ==========================================
# IMPORT ROUTERS
# ==========================================

from app.routers.auth import router as auth_router
from app.routers.expenses import router as expenses_router


# ==========================================
# CREATE DATABASE TABLES
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="Budget Buddy API",
    description="Personal Finance Management System",
    version="1.0.0",
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# ROUTERS
# ==========================================

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)

app.include_router(
    expenses_router,
    prefix="/expenses",
    tags=["Expenses"],
)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():
    return {
        "message": (
            "Welcome to Budget Buddy! "
            "Your Personal Finance Management System "
            "is running successfully."
        )
    }


# ==========================================
# DATABASE TEST
# ==========================================

@app.get("/db-test")
def test_db():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "Database Connected Successfully"
        }

    except Exception as e:
        return {
            "status": "Database Connection Failed",
            "error": str(e),
        }