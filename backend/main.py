# from fastapi import FastAPI
# <<<<<<< Updated upstream
# from routers.auth import router as auth_router

# app = FastAPI()

# app.include_router(auth_router, prefix="/auth")

# @app.get("/")
# def home():
#     return {"message": "Smart Receipt Tracker API"}

# @app.get("/health")
# def health():
#     return {"status": "ok"}
# =======
# app = FastAPI()
# @app.get("/")
# def home():
#     return {"message": "Smart Receipt Tracker API"}
# @app.get("/health")
# def health():
#     return {"status": "ok"}
# from fastapi import FastAPI
# from database import engine, Base
# import models  
# # This import registers all your table classes with SQLAlchemy
# # This creates all tables that don't exist yet (only for quick testing)
# # We'll replace this with Alembic properly in Step 8
# # Base.metadata.create_all(bind=engine)
# app = FastAPI(title="Smart Receipt Tracker API")
# @app.get("/health")
# def health_check():
#     return {"status": "ok", "message": "API is running"}
# >>>>>>> Stashed changes



# from fastapi import FastAPI
# from routers.auth import router as auth_router

# app = FastAPI()

# app.include_router(auth_router, prefix="/auth")

# @app.get("/")
# def home():
#     return {"message": "Smart Receipt Tracker API"}

# @app.get("/health")
# def health():
#     return {"status": "ok"}




# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth

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


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}