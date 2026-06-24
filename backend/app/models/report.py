from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.db.session import Base

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)
    simplified_text = Column(Text, nullable=True)
