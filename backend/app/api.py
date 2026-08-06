from fastapi import APIRouter

from app.routers import auth, expenses, incomes, budgets


router = APIRouter(
    prefix="/api/v1",
)

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
router.include_router(incomes.router, prefix="/incomes", tags=["incomes"])
router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])