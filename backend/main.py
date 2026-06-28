# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth, receipts
from routers import expenses
from routers import auth, receipts, expenses, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Receipt Tracker API")

# CORS will matter more on Day 4, but no harm adding it now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(receipts.router)
app.include_router(
    expenses.router,
    prefix="/expenses"
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}


# backend/main.py

# ... existing code ...

app.include_router(analytics.router, prefix="/analytics")