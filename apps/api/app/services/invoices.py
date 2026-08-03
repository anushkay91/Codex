from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Invoice, InvoiceLine, InventoryMovement, Product
from app.schemas.business import InvoiceCreate
from app.services.audit import record_audit


def create_invoice(db: Session, *, organization_id: str, actor_id: str, payload: InvoiceCreate) -> Invoice:
    subtotal = sum(line.quantity * line.unit_price_paise for line in payload.lines)
    tax = sum(line.quantity * line.unit_price_paise * line.gst_rate_basis_points // 10_000 for line in payload.lines)
    invoice = Invoice(organization_id=organization_id, customer_id=payload.customer_id, invoice_number=payload.invoice_number.strip(), invoice_date=payload.invoice_date, subtotal_paise=subtotal, tax_paise=tax, total_paise=subtotal + tax)
    for line in payload.lines:
        if line.product_id:
            product = db.scalar(select(Product).where(Product.id == line.product_id, Product.organization_id == organization_id))
            if product is None:
                raise ValueError("A referenced product does not belong to this organization")
        invoice.lines.append(InvoiceLine(**line.model_dump()))
    db.add(invoice)
    db.flush()
    record_audit(db, organization_id=organization_id, actor_id=actor_id, action="invoice.created", entity_type="invoice", entity_id=invoice.id)
    return invoice


def confirm_invoice(db: Session, *, organization_id: str, actor_id: str, invoice: Invoice) -> Invoice:
    if invoice.status == "confirmed":
        return invoice
    for line in invoice.lines:
        if not line.product_id:
            continue
        product = db.scalar(select(Product).where(Product.id == line.product_id, Product.organization_id == organization_id))
        if product is None:
            continue
        key = f"invoice:{invoice.id}:line:{line.id}"
        movement = db.scalar(select(InventoryMovement).where(InventoryMovement.idempotency_key == key))
        if movement is None:
            product.stock_quantity -= line.quantity
            db.add(InventoryMovement(organization_id=organization_id, product_id=product.id, invoice_id=invoice.id, quantity_delta=-line.quantity, reason="confirmed_invoice", idempotency_key=key))
    invoice.status = "confirmed"
    record_audit(db, organization_id=organization_id, actor_id=actor_id, action="invoice.confirmed", entity_type="invoice", entity_id=invoice.id)
    return invoice
