from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
import database
import ipfs

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/logs/", response_model=schemas.MiningLogOut)
def create_log(log: schemas.MiningLogCreate, db: Session = Depends(get_db)):
    db_log = models.MiningLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/logs/{wallet}", response_model=list[schemas.MiningLogOut])
def get_logs(wallet: str, db: Session = Depends(get_db)):
    return db.query(models.MiningLog).filter(models.MiningLog.wallet == wallet).order_by(models.MiningLog.created_at.desc()).limit(100).all()

@app.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/ipfs/")
def upload_log_to_ipfs(content: str):
    hash = ipfs.upload_to_ipfs(content)
    return {"ipfs_hash": hash} 