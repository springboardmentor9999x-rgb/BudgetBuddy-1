from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.routers import auth, expenses, incomes, budgets
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

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
app.include_router(incomes.router, prefix="/incomes", tags=["Incomes"])
app.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])

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