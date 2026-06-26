from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.report import ReportResponse

# Import our new AI services
# from app.services.pdf_extractor import extract_text_from_pdf
# from app.services.llm_service import simplify_medical_text
# from app.services.rag_service import process_report_into_vectorstore

router = APIRouter()

@router.post("/upload", response_model=ReportResponse)
async def upload_report(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    # TODO: 
    # 1. Save file to S3 / Local Disk
    # 2. Extract text: text = await extract_text_from_pdf(saved_path)
    # 3. Create FAISS index: await process_report_into_vectorstore(text, new_report.id)
    # 4. Save to DB and return response
    return ReportResponse(id=1, file_path=f"s3://reports/{file.filename}")

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    # TODO: Fetch report from DB
    return ReportResponse(id=report_id, file_path="s3://reports/test.pdf")

@router.post("/{report_id}/simplify", response_model=ReportResponse)
async def simplify_report(report_id: int, db: AsyncSession = Depends(get_db)):
    # TODO: 
    # 1. Fetch extracted_text from DB
    # 2. simplified = await simplify_medical_text(extracted_text)
    # 3. Update DB with simplified text
    return ReportResponse(id=report_id, file_path="s3://reports/test.pdf")
