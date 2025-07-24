from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base

class MiningLog(Base):
    __tablename__ = "mining_logs"
    id = Column(Integer, primary_key=True, index=True)
    wallet = Column(String, index=True)
    message = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    wallet = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 