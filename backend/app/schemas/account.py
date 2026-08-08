from pydantic import BaseModel, Field, ConfigDict


class CreateBankAccount(BaseModel):
    bank_name: str = Field(..., example="Bank of America", description="Name of the bank where the account is held")
    account_number: str = Field(..., example="1234567890", description="Account number")
    balance: float = Field(..., example=1000.00, description="Current balance")
    
class BankAccountOut(CreateBankAccount):
    id: int

    model_config = ConfigDict(from_attributes=True)