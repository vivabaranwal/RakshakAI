from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="PUBLIC") # PUBLIC, GOVT, ENTERPRISE
    
    documents = relationship("Document", back_populates="owner")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    s3_url = Column(String)
    status = Column(String, default="PENDING") # PENDING, PROCESSING, DONE, FAILED
    risk_score = Column(Float, default=0.0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="documents")
    clauses = relationship("Clause", back_populates="document")

class Clause(Base):
    __tablename__ = "clauses"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    clause_type = Column(String)
    content = Column(String)
    bounding_box = Column(JSON) # e.g. [{"page": 1, "x1": 10,...}]
    plain_explanation = Column(String, nullable=True)
    is_red_flag = Column(Boolean, default=False)
    
    document = relationship("Document", back_populates="clauses")
