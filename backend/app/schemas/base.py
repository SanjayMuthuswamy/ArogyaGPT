"""
ArogyaGPT - Base Schema Utilities
Standardized API response wrappers and shared Pydantic v2 configuration.
"""

from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field


# Generic type for response data
T = TypeVar("T")


class BaseSchema(BaseModel):
    """
    Base schema with strict Pydantic v2 configuration.
    All schemas inherit from this.
    """

    model_config = ConfigDict(
        from_attributes=True,      # ORM mode (replaces orm_mode=True)
        populate_by_name=True,     # Accept both alias and field name
        str_strip_whitespace=True, # Auto-strip whitespace from strings
        validate_assignment=True,  # Validate on attribute assignment
        use_enum_values=True,      # Serialize enums as values
    )


class SuccessResponse(BaseModel, Generic[T]):
    """
    Standardized success response envelope.

    Example:
        {
          "success": true,
          "message": "Operation completed successfully.",
          "data": { ... },
          "status": 200
        }
    """

    success: bool = True
    message: str = "Operation completed successfully."
    data: Optional[T] = None
    status: int = 200

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    """
    Standardized error response envelope.

    Example:
        {
          "success": false,
          "message": "Validation failed.",
          "errors": { "email": ["Invalid email format."] },
          "status": 422
        }
    """

    success: bool = False
    message: str
    errors: dict[str, Any] = Field(default_factory=dict)
    status: int = 400


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Paginated list response.

    Includes items, page metadata, and navigation flags.
    """

    success: bool = True
    message: str = "Data retrieved successfully."
    data: list[T] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    per_page: int = 20
    total_pages: int = 0
    has_next: bool = False
    has_previous: bool = False
    status: int = 200

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def create(
        cls,
        items: list[T],
        total: int,
        page: int,
        per_page: int,
        message: str = "Data retrieved successfully.",
    ) -> "PaginatedResponse[T]":
        """Factory method to build paginated response from a query result."""
        total_pages = (total + per_page - 1) // per_page if per_page > 0 else 0
        return cls(
            data=items,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1,
            message=message,
        )


class PaginationParams(BaseModel):
    """Query parameters for pagination."""

    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    per_page: int = Field(default=20, ge=1, le=100, description="Items per page (max 100)")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page

    @property
    def limit(self) -> int:
        return self.per_page
