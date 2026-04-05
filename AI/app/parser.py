import re

def parse_invoice(text: str):
    data = {}

    # Invoice number
    inv = re.search(r"Invoice\s*no[:\s]*([A-Z0-9-]+)", text, re.I)
    data["invoice_number"] = inv.group(1) if inv else None

    # Date
    date = re.search(r"(\d{2}/\d{2}/\d{4})", text)
    data["date"] = date.group(1) if date else None

    # Total
    total = re.search(r"\$\s?([\d,]+\.\d{2})", text)
    data["total"] = total.group(1) if total else None

    return data