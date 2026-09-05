from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProfileUpdate(BaseModel):
    """
    Schema used when the logged-in user edits their profile.

    IMPORTANT:
    Email is intentionally NOT a field here.
    The backend therefore does not allow email to be updated
    through the profile endpoint.
    """

    model_config = ConfigDict(extra="forbid")

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="User's full name",
    )

    monthly_income: float = Field(
        ...,
        ge=0,
        description="Monthly income must be zero or greater",
    )

    currency: str = Field(
        default="INR",
        min_length=3,
        max_length=10,
        description="Currency code, for example INR",
    )

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Full name cannot be empty")

        if len(value) < 2:
            raise ValueError("Full name must contain at least 2 characters")

        return value

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: str) -> str:
        value = value.strip().upper()

        if not value:
            raise ValueError("Currency cannot be empty")

        return value


class ProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    monthly_income: float
    currency: str

    model_config = ConfigDict(from_attributes=True)