from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def home():
    return {"message": "Smart Receipt Tracker API"}


@app.get("/health")
def health():
    return {"status": "ok"}


from fastapi import FastAPI
from database import engine, Base
import models  # This import registers all your table classes with SQLAlchemy

# This creates all tables that don't exist yet (only for quick testing)
# We'll replace this with Alembic properly in Step 8
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Receipt Tracker API")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}