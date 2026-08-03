from datetime import date

from pydantic import BaseModel, Field, model_validator


class ProductCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=200)
    hsn_code: str | None = Field(default=None, max_length=16)
    reorder_point: int = Field(default=0, ge=0)


class ProductResponse(ProductCreate):
    id: str
    stock_quantity: int

    model_config = {"from_attributes": True}


class InvoiceLineCreate(BaseModel):
    product_id: str | None = None
    description: str = Field(min_length=1, max_length=300)
    quantity: int = Field(gt=0)
    unit_price_paise: int = Field(ge=0)
    gst_rate_basis_points: int = Field(default=0, ge=0, le=2_800)


class InvoiceCreate(BaseModel):
    invoice_number: str = Field(min_length=1, max_length=100)
    invoice_date: date
    customer_id: str | None = None
    lines: list[InvoiceLineCreate] = Field(min_length=1, max_length=500)


class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    invoice_date: date
    subtotal_paise: int
    tax_paise: int
    total_paise: int
    status: str

    model_config = {"from_attributes": True}


class PaymentCreate(BaseModel):
    customer_id: str | None = None
    amount_paise: int = Field(gt=0)
    reference: str = Field(min_length=1, max_length=120)
    received_on: date


class PaymentResponse(PaymentCreate):
    id: str
    status: str

    model_config = {"from_attributes": True}


class StockAdjustmentRequest(BaseModel):
    quantity_delta: int = Field(ge=-1_000_000, le=1_000_000)
    reason: str = Field(min_length=2, max_length=80)
    idempotency_key: str = Field(min_length=8, max_length=120)

    @model_validator(mode="after")
    def quantity_must_change(self) -> "StockAdjustmentRequest":
        if self.quantity_delta == 0:
            raise ValueError("quantity_delta cannot be zero")
        return self


class CustomerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    phone: str | None = Field(default=None, max_length=32)
    email: str | None = Field(default=None, max_length=320)
    gstin: str | None = Field(default=None, max_length=15)


class CustomerResponse(CustomerCreate):
    id: str
    organization_id: str

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    revenue_paise: int
    tax_collected_paise: int
    outstanding_paise: int
    low_stock_count: int

