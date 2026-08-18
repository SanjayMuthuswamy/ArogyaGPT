import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from app.db.session import get_db
from app.schemas.report import ReportResponse
from app.models.report import Report

# Import our new AI services
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.llm_service import simplify_medical_text, analyze_health_trends
from app.services.rag_service import process_report_into_vectorstore

router = APIRouter()

@router.post("/upload", response_model=ReportResponse)
async def upload_report(file: UploadFile = File(...), user_id: int = 1, db: AsyncSession = Depends(get_db)):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # 2. Extract text
    text = await extract_text_from_pdf(file_path)
    
    # 3. Save to DB
    new_report = Report(user_id=user_id, file_path=file_path, extracted_text=text)
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    # 4. Create FAISS index
    await process_report_into_vectorstore(text, new_report.id)
    
    return ReportResponse(id=new_report.id, file_path=new_report.file_path)

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.post("/{report_id}/simplify", response_model=ReportResponse)
async def simplify_report(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalars().first()
    if not report or not report.extracted_text:
        raise HTTPException(status_code=404, detail="Report or extracted text not found")
        
    simplified = await simplify_medical_text(report.extracted_text)
    report.simplified_text = simplified
    await db.commit()
    await db.refresh(report)
    
    return report

class TrendsResponse(BaseModel):
    trends_summary: str

@router.get("/trends/{user_id}", response_model=TrendsResponse)
async def get_health_trends(user_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Report).where(Report.user_id == user_id).order_by(Report.created_at.desc()).limit(5)
    result = await db.execute(stmt)
    reports = result.scalars().all()
    
    if len(reports) < 2:
        return TrendsResponse(trends_summary="Not enough data to analyze trends. Please upload more reports (at least 2).")
    
    reports = list(reports)
    reports.reverse() # Oldest first
    
    historical_texts = [r.extracted_text for r in reports[:-1] if r.extracted_text]
    newest_text = reports[-1].extracted_text
    
    if not newest_text:
        return TrendsResponse(trends_summary="The most recent report is empty.")
        
    trends = await analyze_health_trends(historical_reports=historical_texts, new_report=newest_text)
    return TrendsResponse(trends_summary=trends)
