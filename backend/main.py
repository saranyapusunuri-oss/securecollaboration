from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from pymongo import MongoClient
import redis

from database import Base, engine
import models
from auth import router as auth_router

app = FastAPI(
    title="Secure Collaboration API",
    description="Backend for Secure Collaboration System",
    version="2.0.0"
)

app.include_router(auth_router)


@app.on_event("startup")
def create_database_tables():
    Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

postgres_url = (
    "postgresql+psycopg2://secureuser:securepass123"
    "@localhost:5432/securecollab"
)
postgres_engine = create_engine(postgres_url, pool_pre_ping=True)

mongo_client = MongoClient(
    "mongodb://admin:mongopass123@localhost:27017/"
    "?authSource=admin",
    serverSelectionTimeoutMS=3000
)
mongo_db = mongo_client["securecollab"]

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True,
    socket_connect_timeout=3
)


@app.get("/")
def home():
    return {"message": "Welcome to Secure Collaboration Backend!"}


@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "message": "Backend Connected Successfully!"
    }


@app.get("/api/database-status")
def database_status():
    results = {}

    try:
        with postgres_engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        results["postgresql"] = "Connected"
    except Exception as e:
        results["postgresql"] = f"Failed: {str(e)}"

    try:
        mongo_client.admin.command("ping")
        results["mongodb"] = "Connected"
    except Exception as e:
        results["mongodb"] = f"Failed: {str(e)}"

    try:
        redis_client.ping()
        results["redis"] = "Connected"
    except Exception as e:
        results["redis"] = f"Failed: {str(e)}"

    return {
        "status": "success",
        "database_connections": results
    }
