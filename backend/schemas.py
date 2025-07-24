from pydantic import BaseModel
from datetime import datetime

class MiningLogBase(BaseModel):
    wallet: str
    message: str

class MiningLogCreate(MiningLogBase):
    pass

class MiningLogOut(MiningLogBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    wallet: str

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True 