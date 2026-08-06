from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.schemas.income import IncomeCreate, IncomeUpdate, IncomeResponse
from app.crud.income import (
    create_income, 
    get_incomes_by_user, 
    get_income, 
    update_income, 
    delete_income
)
from app.database import get_db


router = APIRouter()

@router.post("/add-income", response_model=IncomeResponse, status_code=201)
def add_income(
    income: IncomeCreate, 
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
    ):
    return create_income(db, user_id=current_user.id, **income.model_dump())

@router.get("/incomes", response_model=list[IncomeResponse], status_code=200)
def list_incomes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
    ):
    return get_incomes_by_user(db, current_user.id, skip=skip, limit=limit)

@router.get("/income/{income_id}", response_model=IncomeResponse, status_code=200)
def get_income_by_id(
    income_id: int, 
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
    ):
    income = get_income(db, income_id, current_user.id)
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    return income

@router.put("/income/{income_id}", response_model=IncomeResponse, status_code=200)
def update_income_by_id(
    income_id: int, 
    income_update: IncomeUpdate, 
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
    ):
    updated_income = update_income(db, current_user.id, income_id, **income_update.model_dump(exclude_unset=True))
    if not updated_income:
        raise HTTPException(status_code=404, detail="Income not found")
    return updated_income

@router.delete("/income/{income_id}", status_code=200)
def delete_income_by_id(
    income_id: int, 
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
    ):
    result = delete_income(db, current_user.id, income_id)
    if not result:
        raise HTTPException(status_code=404, detail="Income not found")
    return result