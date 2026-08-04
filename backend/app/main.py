from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, expenses, incomes

app = FastAPI(title="BudgetBuddy API")

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

@app.get("/")
def root():
    return {"message": "BudgetBuddy API running"}