from fastapi import APIRouter

from app.routers import (
    auth, expenses, incomes, budgets,
    accounts, dashboard, users, savings, reports,
    websocket, admin
)


router = APIRouter(
    prefix="/api/v1",
)

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
router.include_router(incomes.router, prefix="/incomes", tags=["incomes"])
router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
router.include_router(savings.router, prefix="/savings", tags=["savings"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
router.include_router(reports.router, prefix="/reports", tags=["reports"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
router.include_router(websocket.router, tags=["websocket"])