from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.report import ReportResponse

router = APIRouter()

@router.post("/upload", response_model=ReportResponse)
async def upload_report(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    return ReportResponse(id=1, file_path=f"s3://reports/{file.filename}")

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    return ReportResponse(id=report_id, file_path="s3://reports/test.pdf")

@router.post("/{report_id}/simplify", response_model=ReportResponse)
async def simplify_report(report_id: int, db: AsyncSession = Depends(get_db)):
    return ReportResponse(id=report_id, file_path="s3://reports/test.pdf")
