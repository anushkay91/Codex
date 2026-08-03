from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import TimestampedModel


class Organization(TimestampedModel, Base):
    __tablename__ = "organizations"
    name: Mapped[str] = mapped_column(String(160))
    gstin: Mapped[str | None] = mapped_column(String(15), unique=True)
    state_code: Mapped[str | None] = mapped_column(String(2))


class User(TimestampedModel, Base):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    memberships: Mapped[list["OrganizationMember"]] = relationship(back_populates="user")


class OrganizationMember(TimestampedModel, Base):
    __tablename__ = "organization_members"
    __table_args__ = (UniqueConstraint("organization_id", "user_id", name="uq_member_org_user"),)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String(20), default="owner")
    user: Mapped[User] = relationship(back_populates="memberships")


class Customer(TimestampedModel, Base):
    __tablename__ = "customers"
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str | None] = mapped_column(String(32))
    email: Mapped[str | None] = mapped_column(String(320))
    gstin: Mapped[str | None] = mapped_column(String(15))


class Document(TimestampedModel, Base):
    __tablename__ = "documents"
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    original_filename: Mapped[str] = mapped_column(String(255))
    storage_key: Mapped[str] = mapped_column(String(255), unique=True)
    content_hash: Mapped[str] = mapped_column(String(64), index=True)
    mime_type: Mapped[str] = mapped_column(String(100))
    size_bytes: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default="uploaded")


class Product(TimestampedModel, Base):
    __tablename__ = "products"
    __table_args__ = (UniqueConstraint("organization_id", "sku", name="uq_product_org_sku"),)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    sku: Mapped[str] = mapped_column(String(80))
    name: Mapped[str] = mapped_column(String(200))
    hsn_code: Mapped[str | None] = mapped_column(String(16))
    reorder_point: Mapped[int] = mapped_column(Integer, default=0)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)


class Invoice(TimestampedModel, Base):
    __tablename__ = "invoices"
    __table_args__ = (UniqueConstraint("organization_id", "invoice_number", name="uq_invoice_org_number"),)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"))
    invoice_number: Mapped[str] = mapped_column(String(100))
    invoice_date: Mapped[date] = mapped_column(Date)
    subtotal_paise: Mapped[int] = mapped_column(Integer)
    tax_paise: Mapped[int] = mapped_column(Integer, default=0)
    total_paise: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(24), default="draft")
    lines: Mapped[list["InvoiceLine"]] = relationship(back_populates="invoice", cascade="all, delete-orphan")


class InvoiceLine(TimestampedModel, Base):
    __tablename__ = "invoice_lines"
    invoice_id: Mapped[str] = mapped_column(ForeignKey("invoices.id"), index=True)
    product_id: Mapped[str | None] = mapped_column(ForeignKey("products.id"))
    description: Mapped[str] = mapped_column(String(300))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price_paise: Mapped[int] = mapped_column(Integer)
    gst_rate_basis_points: Mapped[int] = mapped_column(Integer, default=0)
    invoice: Mapped[Invoice] = relationship(back_populates="lines")


class InventoryMovement(TimestampedModel, Base):
    __tablename__ = "inventory_movements"
    __table_args__ = (UniqueConstraint("idempotency_key", name="uq_movement_idempotency"),)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    invoice_id: Mapped[str | None] = mapped_column(ForeignKey("invoices.id"))
    quantity_delta: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(80))
    idempotency_key: Mapped[str] = mapped_column(String(120))


class Payment(TimestampedModel, Base):
    __tablename__ = "payments"
    __table_args__ = (UniqueConstraint("organization_id", "reference", name="uq_payment_org_reference"),)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"))
    amount_paise: Mapped[int] = mapped_column(Integer)
    reference: Mapped[str] = mapped_column(String(120))
    received_on: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(24), default="unallocated")


class GstFiling(TimestampedModel, Base):
    __tablename__ = "gst_filings"
    __table_args__ = (UniqueConstraint("organization_id", "period", name="uq_gst_org_period"),)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    period: Mapped[str] = mapped_column(String(7))
    taxable_value_paise: Mapped[int] = mapped_column(Integer, default=0)
    tax_due_paise: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(24), default="draft")
