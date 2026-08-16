from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    file_path = Column(String, nullable=True)
    mode = Column(String, default="Personal")           # Personal | Enterprise | Govt
    status = Column(String, default="PENDING")          # PENDING|PROCESSING|COMPLETED|FAILED
    error_message = Column(String, nullable=True)
    risk_score = Column(Float, default=0.0)
    analysis_summary = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    clauses = relationship(
        "Clause", back_populates="document", cascade="all, delete-orphan"
    )


class Clause(Base):
    __tablename__ = "clauses"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), index=True)
    clause_type = Column(String)
    severity = Column(String, default="CAUTION")        # FRAUD | ALERT | CAUTION
    content = Column(Text)
    legal_basis = Column(Text, nullable=True)           # Indian statute / precedent
    suggested_clause = Column(Text, nullable=True)      # corrected replacement wording
    bounding_box = Column(JSON)                         # {x1,y1,x2,y2,width,height}
    page = Column(Integer, default=1)
    fairness_score = Column(Integer, default=50)
    plain_explanation = Column(Text, nullable=True)
    is_red_flag = Column(Boolean, default=False)

    document = relationship("Document", back_populates="clauses")
