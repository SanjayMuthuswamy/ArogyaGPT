from pydantic import BaseModel
from typing import Optional

class ReportUploadRequest(BaseModel):
    file_name: str
    user_id: int

class SimplifiedReport(BaseModel):
    summary: str
    key_findings: list[str]
    recommendations: list[str]

class ReportResponse(BaseModel):
    id: int
    file_path: str
    simplified_text: Optional[SimplifiedReport] = None
