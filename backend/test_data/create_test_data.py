"""Generate dummy test PDFs for CertiGuard."""

import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch


def create_tender_pdf():
    """Create a sample tender document."""
    filepath = os.path.join(os.path.dirname(__file__), "tender", "tender_001.pdf")
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*inch, height - 1*inch, "TENDER DOCUMENT")

    c.setFont("Helvetica", 12)
    y = height - 1.5*inch

    lines = [
        "Tender ID: T001",
        "Tender Name: CRPF Uniform Supply 2026",
        "Submission Deadline: 2026-06-15",
        "",
        "EVALUATION CRITERIA:",
        "",
        "1. Valid GST Registration (MANDATORY)",
        "   - Must have valid GSTIN certificate",
        "   - GST should be active as on submission date",
        "",
        "2. Minimum 3 Years Experience (MANDATORY)",
        "   - Should have at least 3 years of experience in similar work",
        "   - Experience certificate from previous clients required",
        "",
        "3. Annual Turnover above 50 Lakh (DESIRABLE)",
        "   - ITR documents for last 3 years required",
        "   - Average turnover should exceed Rs. 50 Lakhs",
    ]

    for line in lines:
        c.drawString(1*inch, y, line)
        y -= 0.25*inch

    c.save()
    print(f"Created: {filepath}")


def create_bidder_gst_pdf(bidder_id, company_name, gstin, status="Active"):
    """Create a GST certificate PDF for a bidder."""
    filepath = os.path.join(os.path.dirname(__file__), "bidders", f"{bidder_id}_gst.pdf")
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, height - 1*inch, "GST REGISTRATION CERTIFICATE")

    c.setFont("Helvetica", 11)
    y = height - 1.5*inch

    lines = [
        f"Company Name: {company_name}",
        f"GSTIN: {gstin}",
        f"Status: {status}",
        f"Date of Registration: 2020-04-15",
        f"State: Maharashtra",
        "Tax Payer Type: Regular",
        "Filing Type: Monthly",
    ]

    for line in lines:
        c.drawString(1*inch, y, line)
        y -= 0.25*inch

    c.save()
    print(f"Created: {filepath}")


def create_bidder_pan_pdf(bidder_id, company_name, pan):
    """Create a PAN card PDF for a bidder."""
    filepath = os.path.join(os.path.dirname(__file__), "bidders", f"{bidder_id}_pan.pdf")
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, height - 1*inch, "PAN CARD")

    c.setFont("Helvetica", 11)
    y = height - 1.5*inch

    lines = [
        f"Company Name: {company_name}",
        f"PAN Number: {pan}",
        "Date of Incorporation: 2018-03-20",
        "Entity Type: Private Limited Company",
    ]

    for line in lines:
        c.drawString(1*inch, y, line)
        y -= 0.25*inch

    c.save()
    print(f"Created: {filepath}")


def create_bidder_experience_pdf(bidder_id, company_name, years):
    """Create an experience certificate PDF for a bidder."""
    filepath = os.path.join(os.path.dirname(__file__), "bidders", f"{bidder_id}_experience.pdf")
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, height - 1*inch, "EXPERIENCE CERTIFICATE")

    c.setFont("Helvetica", 11)
    y = height - 1.5*inch

    lines = [
        f"This is to certify that {company_name} has been providing",
        f"supply services to our organization for the past {years} years.",
        "",
        f"Period: 2021-01-01 to Present",
        f"Total Experience: {years} Years",
        "Work Description: Uniform and Safety Equipment Supply",
        "Performance: Satisfactory",
    ]

    for line in lines:
        c.drawString(1*inch, y, line)
        y -= 0.25*inch

    c.save()
    print(f"Created: {filepath}")


def create_bidder_turnover_pdf(bidder_id, company_name, amount, unit="Lakhs"):
    """Create an ITR/Turnover certificate PDF for a bidder."""
    filepath = os.path.join(os.path.dirname(__file__), "bidders", f"{bidder_id}_turnover.pdf")
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4
    
    amount_val = float(amount)

    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, height - 1*inch, "INCOME TAX RETURN - TURNOVER CERTIFICATE")

    c.setFont("Helvetica", 11)
    y = height - 1.5*inch

    lines = [
        f"Company Name: {company_name}",
        f"Financial Year: 2023-24",
        f"Annual Turnover: Rs. {amount} {unit}",
        f"Net Profit: Rs. {amount_val/5:.1f} {unit}",
        f"Tax Paid: Rs. {amount_val/10:.1f} {unit}",
        "ITR Filed: Yes",
        "Acknowledgment No: ABCD123456789",
    ]

    for line in lines:
        c.drawString(1*inch, y, line)
        y -= 0.25*inch

    c.save()
    print(f"Created: {filepath}")


def create_bidder_certification_pdf(bidder_id, company_name, cert_type, cert_number, year):
    """Create an ISO certification PDF for a bidder."""
    filepath = os.path.join(os.path.dirname(__file__), "bidders", f"{bidder_id}_cert.pdf")
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, height - 1*inch, "ISO CERTIFICATION")

    c.setFont("Helvetica", 11)
    y = height - 1.5*inch

    lines = [
        f"Company Name: {company_name}",
        f"Certification: {cert_type}",
        f"Certificate Number: {cert_number}",
        f"Year of Certification: {year}",
        "Valid Until: 2027-12-31",
        "Certifying Body: Bureau Veritas",
        "Scope: Quality Management System",
    ]

    for line in lines:
        c.drawString(1*inch, y, line)
        y -= 0.25*inch

    c.save()
    print(f"Created: {filepath}")


def create_tender_v2():
    """Create tender T002 - CRPF Security Services 2026"""
    filepath = os.path.join(os.path.dirname(__file__), "tender", "tender_002.pdf")
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*inch, height - 1*inch, "TENDER DOCUMENT")

    c.setFont("Helvetica", 12)
    y = height - 1.5*inch

    lines = [
        "Tender ID: T002",
        "Tender Name: CRPF Security Services 2026",
        "Submission Deadline: 2026-07-15",
        "",
        "EVALUATION CRITERIA:",
        "",
        "1. Valid GST Registration (MANDATORY)",
        "   - Must have valid GSTIN certificate",
        "   - GST should be active as on submission date",
        "",
        "2. Minimum 5 Years Experience (MANDATORY)",
        "   - Should have at least 5 years of experience in security services",
        "   - Experience certificate from previous clients required",
        "",
        "3. Annual Turnover above 1 Crore (DESIRABLE)",
        "   - ITR documents for last 3 years required",
        "   - Average turnover should exceed Rs. 1 Crore",
        "",
        "4. ISO 9001 Certification (DESIRABLE)",
        "   - Quality management certification required",
    ]

    for line in lines:
        c.drawString(1*inch, y, line)
        y -= 0.25*inch

    c.save()
    print(f"Created: {filepath}")


if __name__ == "__main__":
    print("Creating test data...")

    # Create tender T001
    create_tender_pdf()

    # Create bidder 1 - ELIGIBLE (good GST, good experience, good turnover, has ISO)
    create_bidder_gst_pdf("B001", "Alpha Textiles Ltd", "27AAACM1234A1Z5", "Active")
    create_bidder_pan_pdf("B001", "Alpha Textiles Ltd", "AABCD1234E")
    create_bidder_experience_pdf("B001", "Alpha Textiles Ltd", "5")
    create_bidder_turnover_pdf("B001", "Alpha Textiles Ltd", "78.5")
    create_bidder_certification_pdf("B001", "Alpha Textiles Ltd", "ISO 9001:2015", "QMS-2024-12345", "2024")

    # Create bidder 2 - NOT_ELIGIBLE (expired GST)
    create_bidder_gst_pdf("B002", "Beta Garments Pvt Ltd", "29AAECB1234A1Z3", "Expired")
    create_bidder_pan_pdf("B002", "Beta Garments Pvt Ltd", "AABCE5678F")
    create_bidder_experience_pdf("B002", "Beta Garments Pvt Ltd", "4")
    create_bidder_turnover_pdf("B002", "Beta Garments Pvt Ltd", "45")
    create_bidder_certification_pdf("B002", "Beta Garments Pvt Ltd", "ISO 9001:2015", "QMS-2023-98765", "2023")

    # Create bidder 3 - NEEDS_REVIEW (ambiguous dates in experience)
    create_bidder_gst_pdf("B003", "Gamma Industries", "07AAACG5678A1Z9", "Active")
    create_bidder_pan_pdf("B003", "Gamma Industries", "AABCF9012G")
    create_bidder_experience_pdf("B003", "Gamma Industries", "3")  # Ambiguous
    create_bidder_turnover_pdf("B003", "Gamma Industries", "52")
    create_bidder_certification_pdf("B003", "Gamma Industries", "ISO 14001:2015", "EMS-2024-54321", "2024")

    print("\n--- Creating T002 Security Services tender and bidders ---")
    
    # Create tender T002 - Security Services
    create_tender_v2()
    
    # Create bidder for T002 - ELIGIBLE (5+ years, 1+ Crore, valid GST)
    create_bidder_gst_pdf("S001", "SecureForce Pvt Ltd", "19AAECS1234A1Z9", "Active")
    create_bidder_pan_pdf("S001", "SecureForce Pvt Ltd", "AAECS1234K")
    create_bidder_experience_pdf("S001", "SecureForce Pvt Ltd", "7")
    create_bidder_turnover_pdf("S001", "SecureForce Pvt Ltd", "1.5", "Crore")  # 1.5 Crore
    create_bidder_certification_pdf("S001", "SecureForce Pvt Ltd", "ISO 9001:2015", "SEC-2024-11111", "2024")
    
    # Create bidder for T002 - NOT_ELIGIBLE (only 3 years, low turnover)
    create_bidder_gst_pdf("S002", "QuickSecurity Services", "27AAQQS5678A1Z3", "Active")
    create_bidder_pan_pdf("S002", "QuickSecurity Services", "AAQQS5678M")
    create_bidder_experience_pdf("S002", "QuickSecurity Services", "3")  # Below 5 years
    create_bidder_turnover_pdf("S002", "QuickSecurity Services", "80", "Lakhs")  # 80 Lakhs = 0.8 Crore
    # No ISO certification
    
    # Create bidder for T002 - NEEDS_REVIEW (5 years exactly - borderline)
    create_bidder_gst_pdf("S003", "Guardian Services Ltd", "29AABGG9012A1Z5", "Active")
    create_bidder_pan_pdf("S003", "Guardian Services Ltd", "AABGG9012P")
    create_bidder_experience_pdf("S003", "Guardian Services Ltd", "5")  # Exactly 5 years - borderline
    create_bidder_turnover_pdf("S003", "Guardian Services Ltd", "1.05", "Crore")  # Just above 1 Crore
    create_bidder_certification_pdf("S003", "Guardian Services Ltd", "ISO 9001:2015", "GDN-2024-99999", "2024")

    print("\nDone! Test data created in backend/test_data/")