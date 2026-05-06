"""CertiGuard - Main entry point with real pipeline integration."""

import sys
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

app = FastAPI(title="CertiGuard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage for processed tenders (in-memory for demo)
PROCESSED_RESULTS: Dict[str, Dict] = {}
TENDERS_LIST = [
    {"tender_id": "T001", "tender_name": "CRPF Uniform Supply 2026", "bidder_count": 3, "status": "active", "submission_deadline": "2026-06-15"},
    {"tender_id": "T002", "tender_name": "CRPF IT Equipment 2026", "bidder_count": 5, "status": "active", "submission_deadline": "2026-07-01"},
    {"tender_id": "T003", "tender_name": "CRPF Security Services", "bidder_count": 4, "status": "completed", "submission_deadline": "2026-04-15"},
]


# ============ Models ============

class OverrideInput(BaseModel):
    criterion_id: str
    bidder_id: str
    override_verdict: str
    officer_id: str
    officer_name: str
    rationale: str
    signature: str


class ProcessTenderRequest(BaseModel):
    tender_id: str
    tender_name: str


# ============ Pipeline Integration ============

def run_pipeline_async(tender_id: str, tender_path: str, bidders_dir: str, output_dir: str):
    """Run pipeline in background."""
    try:
        from backend.src.pipeline.main import run_pipeline
        result = run_pipeline(tender_id, tender_path, bidders_dir, output_dir)
        PROCESSED_RESULTS[tender_id] = result
        print(f"[API] Pipeline completed for tender: {tender_id}")
    except Exception as e:
        print(f"[API] Pipeline failed: {e}")
        PROCESSED_RESULTS[tender_id] = {"error": str(e)}


# ============ Routes ============

@app.get("/")
def root():
    return {"status": "CertiGuard API", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/v1/tenders")
def get_tenders():
    return {"tenders": TENDERS_LIST}


@app.get("/api/v1/review/queue")
def get_review_queue(tender_id: str = Query(...)):
    # Check if we have real pipeline results
    if tender_id in PROCESSED_RESULTS:
        result = PROCESSED_RESULTS[tender_id]
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result

    # Fall back to mock data for demo
    return build_mock_verdict(tender_id)


@app.get("/api/v1/review/criterion/{criterion_id}")
def get_criterion_detail(criterion_id: str, bidder_id: str = Query(...)):
    # Check pipeline results first
    for tender_id, result in PROCESSED_RESULTS.items():
        if "bidders" in result:
            for bidder in result["bidders"]:
                if bidder["bidder_id"] == bidder_id:
                    for criterion in bidder["criterion_results"]:
                        if criterion["criterion_id"] == criterion_id:
                            detail = criterion.copy()
                            detail["bidder_name"] = bidder["bidder_name"]
                            return detail

    raise HTTPException(status_code=404, detail="Criterion not found")


@app.post("/api/v1/process/tender")
def process_tender(
    tender_id: str = Query(...),
    tender_name: str = Query(...),
    background_tasks: BackgroundTasks = None
):
    """Process a tender using the ML pipeline."""
    # Paths for test data
    base_dir = Path(__file__).parent / "backend" / "test_data"
    tender_path = str(base_dir / "tender" / f"tender_{tender_id.split('T')[1]}.pdf")
    bidders_dir = str(base_dir / "bidders")
    output_dir = str(base_dir / "output")

    # Create directories
    os.makedirs(base_dir / "tender", exist_ok=True)
    os.makedirs(bidders_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    # Check if test data exists
    if not os.path.exists(tender_path):
        # Create sample tender
        create_sample_tender(tender_id, tender_name, tender_path)

    # Run pipeline in background
    try:
        from backend.src.pipeline.main import run_pipeline
        result = run_pipeline(tender_id, tender_path, bidders_dir, output_dir)
        PROCESSED_RESULTS[tender_id] = result
        return {
            "status": "completed",
            "tender_id": tender_id,
            "result": result
        }
    except Exception as e:
        return {
            "status": "error",
            "tender_id": tender_id,
            "error": str(e)
        }


def create_sample_tender(tender_id: str, tender_name: str, filepath: str):
    """Create a sample tender PDF."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch

        c = canvas.Canvas(filepath, pagesize=A4)
        width, height = A4

        c.setFont("Helvetica-Bold", 16)
        c.drawString(1*inch, height - 1*inch, "TENDER DOCUMENT")

        c.setFont("Helvetica", 12)
        y = height - 1.5*inch

        lines = [
            f"Tender ID: {tender_id}",
            f"Tender Name: {tender_name}",
            "Submission Deadline: 2026-06-15",
            "",
            "EVALUATION CRITERIA:",
            "",
            "1. Valid GST Registration (MANDATORY)",
            "2. Minimum 3 Years Experience (MANDATORY)",
            "3. Annual Turnover above 50 Lakh (DESIRABLE)",
        ]

        for line in lines:
            c.drawString(1*inch, y, line)
            y -= 0.25*inch

        c.save()
    except Exception as e:
        print(f"Failed to create tender: {e}")


@app.post("/api/v1/override/apply")
def apply_override(override: OverrideInput):
    return {
        "applied": True,
        "officer_id": override.officer_id,
        "officer_name": override.officer_name,
        "override_verdict": override.override_verdict,
        "rationale": override.rationale,
        "signature": override.signature,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/v1/report/generate")
def generate_report(tender_id: str = Query(...), format: str = Query("pdf")):
    if tender_id in PROCESSED_RESULTS:
        result = PROCESSED_RESULTS[tender_id]
        return {
            "format": format,
            "tender_id": tender_id,
            "data": result,
            "generated_at": datetime.now().isoformat()
        }

    return build_mock_report(tender_id, format)


@app.get("/api/v1/report/download/{format}")
def download_report(format: str, tender_id: str = Query(...)):
    if tender_id in PROCESSED_RESULTS:
        result = PROCESSED_RESULTS[tender_id]
        return {
            "format": format,
            "tender_id": tender_id,
            "record_count": len(result.get("bidders", [])),
            "download_url": f"/api/v1/report/download/{format}?tender_id={tender_id}"
        }

    return build_mock_report(tender_id, format)


# ============ Mock Data (Fallback) ============

def build_mock_verdict(tender_id: str) -> dict:
    """Fallback mock data when pipeline not run."""
    return {
        "tender_id": tender_id,
        "tender_name": "CRPF Uniform Supply 2026",
        "submission_deadline": "2026-06-15",
        "bidders": [
            {
                "bidder_id": "B001",
                "bidder_name": "Alpha Textiles Ltd",
                "criterion_results": [
                    {"criterion_id": "C001", "criterion_label": "Valid GST Registration", "verdict": "ELIGIBLE", "ai_confidence": 0.98, "verification_checks": [{"check_name": "GSTIN Format", "passed": True, "detail": "Valid GSTIN format", "confidence": 0.98}], "yellow_flags": None, "evidence_refs": ["gstin"], "reason": "GSTIN verified"},
                    {"criterion_id": "C002", "criterion_label": "Minimum 3 Years Experience", "verdict": "NEEDS_REVIEW", "ai_confidence": 0.65, "verification_checks": [{"check_name": "Experience Years", "passed": True, "detail": "Experience found", "confidence": 0.7}], "yellow_flags": [{"trigger_type": "AMBIGUOUS", "reason": "Date unclear", "affected_entity": "experience", "confidence_delta": -0.3}], "evidence_refs": ["experience"], "reason": "Dates ambiguous"},
                    {"criterion_id": "C003", "criterion_label": "Annual Turnover above 50L", "verdict": "ELIGIBLE", "ai_confidence": 0.95, "verification_checks": [{"check_name": "Turnover Validation", "passed": True, "detail": "78.5L verified", "confidence": 0.95}], "yellow_flags": None, "evidence_refs": ["turnover"], "reason": "Turnover 78.5L"},
                ],
                "overall_verdict": "NEEDS_REVIEW",
                "overall_confidence": 0.86,
                "verdict_reason": "1 criterion needs review"
            },
            {
                "bidder_id": "B002",
                "bidder_name": "Beta Garments Pvt Ltd",
                "criterion_results": [
                    {"criterion_id": "C001", "criterion_label": "Valid GST Registration", "verdict": "NOT_ELIGIBLE", "ai_confidence": 0.92, "verification_checks": [{"check_name": "GSTIN Format", "passed": False, "detail": "GST expired", "confidence": 0.92}], "yellow_flags": None, "evidence_refs": ["gstin"], "reason": "GST registration expired"},
                    {"criterion_id": "C002", "criterion_label": "Minimum 3 Years Experience", "verdict": "ELIGIBLE", "ai_confidence": 0.88, "verification_checks": [{"check_name": "Experience Years", "passed": True, "detail": "4 years", "confidence": 0.88}], "yellow_flags": None, "evidence_refs": ["experience"], "reason": "Experience verified"},
                    {"criterion_id": "C003", "criterion_label": "Annual Turnover above 50L", "verdict": "ELIGIBLE", "ai_confidence": 0.9, "verification_checks": [{"check_name": "Turnover Validation", "passed": True, "detail": "45L below but optional", "confidence": 0.9}], "yellow_flags": None, "evidence_refs": ["turnover"], "reason": "Optional criterion"},
                ],
                "overall_verdict": "NOT_ELIGIBLE",
                "overall_confidence": 0.9,
                "verdict_reason": "Failed mandatory criterion"
            },
            {
                "bidder_id": "B003",
                "bidder_name": "Gamma Industries",
                "criterion_results": [
                    {"criterion_id": "C001", "criterion_label": "Valid GST Registration", "verdict": "ELIGIBLE", "ai_confidence": 0.99, "verification_checks": [{"check_name": "GSTIN Format", "passed": True, "detail": "Valid", "confidence": 0.99}], "yellow_flags": None, "evidence_refs": ["gstin"], "reason": "Active GST"},
                    {"criterion_id": "C002", "criterion_label": "Minimum 3 Years Experience", "verdict": "ELIGIBLE", "ai_confidence": 0.85, "verification_checks": [{"check_name": "Experience Years", "passed": True, "detail": "3 years", "confidence": 0.85}], "yellow_flags": None, "evidence_refs": ["experience"], "reason": "Met minimum"},
                    {"criterion_id": "C003", "criterion_label": "Annual Turnover above 50L", "verdict": "NEEDS_REVIEW", "ai_confidence": 0.6, "verification_checks": [{"check_name": "Turnover Validation", "passed": True, "detail": "52L close to threshold", "confidence": 0.6}], "yellow_flags": [{"trigger_type": "CLOSE_THRESHOLD", "reason": "Close to 50L", "affected_entity": "turnover", "confidence_delta": -0.25}], "evidence_refs": ["turnover"], "reason": "Close to threshold"},
                ],
                "overall_verdict": "NEEDS_REVIEW",
                "overall_confidence": 0.81,
                "verdict_reason": "1 criterion needs review"
            },
        ],
        "audit_records": [],
        "yellow_flag_summary": {"total": 2, "by_type": {"AMBIGUOUS": 1, "CLOSE_THRESHOLD": 1}}
    }


def build_mock_report(tender_id: str, format: str) -> dict:
    return {
        "format": format,
        "tender_id": tender_id,
        "data": build_mock_verdict(tender_id),
        "generated_at": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)