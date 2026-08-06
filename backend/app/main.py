from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import router as api_router
from app.database import engine


app = FastAPI(title="BudgetBuddy API", version="1.0.0")

# Allowed origins that can make requests to backend.
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "BudgetBuddy API running"}

@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"database": "healthy"}
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database unavailable"
        )