from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import auth, workspaces, projects, tasks

# Auto-create tables on startup if not present
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WorkOrbit API",
    description="Modern Full-Stack Project & Team Collaboration Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(workspaces.router)
app.include_router(projects.router)
app.include_router(tasks.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "WorkOrbit",
        "version": "1.0.0",
        "engine": "FastAPI + SQLAlchemy",
        "database": "SQLite / PostgreSQL ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
