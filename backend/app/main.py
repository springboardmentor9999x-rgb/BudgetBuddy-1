from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth
from app.routers import accounts
from app.routers import expenses
from app.routers import income
from app.routers import profile
from app.routers import budget
from app.routers import savings_goals
from app.routers import notifications
from app.routers import reminders
from app.routers import monthly_report
from app.routers import analytics
from app.routers import reports
from app.routers import admin
from app.routers import premium


app = FastAPI(
    title="Budget Buddy",
    description="Personal Finance Management System",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(accounts.router, prefix="/accounts", tags=["Accounts"])
app.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
app.include_router(income.router, prefix="/income", tags=["Income"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(budget.router, prefix="/budgets", tags=["Budgets"])
app.include_router(savings_goals.router, prefix="/savings-goals", tags=["Savings Goals"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(reminders.router, prefix="/reminders", tags=["Reminders"])
app.include_router(monthly_report.router, prefix="/monthly-report", tags=["Monthly Report"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(premium.router, prefix="/premium", tags=["Premium"])


@app.get("/")
def root():
    return {
        "message": (
            "Welcome to Budget Buddy! "
            "Your Personal Finance Management System "
            "is running successfully."
        )
    }
