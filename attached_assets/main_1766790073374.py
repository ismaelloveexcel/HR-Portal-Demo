from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    passes, admin, recruitment, availability, candidates, interviews,
    attendance, ess, policies, templates
)

app = FastAPI(title="Baynunah HR Pass API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

app.include_router(passes.router, prefix="/api/passes", tags=["passes"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(recruitment.router, prefix="/api/rr", tags=["recruitment"])
app.include_router(availability.router, prefix="/api/availability", tags=["availability"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["candidates"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["interviews"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["attendance"])
app.include_router(ess.router, prefix="/api/ess", tags=["ess"])
app.include_router(policies.router, prefix="/api/policies", tags=["policies"])
app.include_router(templates.router, prefix="/api/templates", tags=["templates"])

@app.get("/health")
def health():
    return {"ok": True}