from sqlalchemy import Column, String, Integer, DateTime, Date, JSON, ForeignKey, Boolean, Float
from sqlalchemy.sql import func
from .db import Base

class AdminUser(Base):
    __tablename__ = "admin_users"
    email = Column(String, primary_key=True)
    password_hash = Column(String)
    totp_secret = Column(String)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
    actor = Column(String)
    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(String)
    metadata = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class Pass(Base):
    __tablename__ = "passes"
    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    type = Column(String)
    scope = Column(JSON)
    expires_at = Column(DateTime)
    max_uses = Column(Integer, default=1)
    used_count = Column(Integer, default=0)
    status = Column(String, default="active")
    meta = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class RecruitmentRequest(Base):
    __tablename__ = "recruitment_requests"
    id = Column(String, primary_key=True)
    title = Column(String)
    department = Column(String)
    location = Column(String)
    level = Column(String)
    salary_range = Column(String)
    jd_url = Column(String)
    status = Column(String, default="open")
    hiring_manager_id = Column(String)
    agency_ids = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(String, primary_key=True)
    rr_id = Column(String, ForeignKey("recruitment_requests.id"))
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    resume_url = Column(String)
    source = Column(String)
    current_stage = Column(String, default="applied")
    notes = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"
    id = Column(String, primary_key=True)
    rr_id = Column(String, ForeignKey("recruitment_requests.id"))
    interviewer_id = Column(String)
    start_time = Column(DateTime)
    duration_minutes = Column(Integer, default=30)
    mode = Column(String)
    location = Column(String)
    status = Column(String, default="open")  # open/held/booked/expired
    created_at = Column(DateTime, server_default=func.now())

class Interview(Base):
    __tablename__ = "interviews"
    id = Column(String, primary_key=True)
    candidate_id = Column(String, ForeignKey("candidates.id"))
    rr_id = Column(String, ForeignKey("recruitment_requests.id"))
    interviewer_id = Column(String)
    availability_slot_id = Column(String, ForeignKey("availability_slots.id"))
    slot_time = Column(DateTime)
    duration_minutes = Column(Integer, default=30)
    mode = Column(String)
    status = Column(String, default="scheduled")
    feedback = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class ESSRequest(Base):
    __tablename__ = "ess_requests"
    id = Column(String, primary_key=True)
    employee_id = Column(String)
    type = Column(String)
    status = Column(String, default="open")
    payload = Column(JSON)
    attachments = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"
    id = Column(String, primary_key=True)
    employee_id = Column(String, index=True)
    date = Column(Date)
    time_in = Column(DateTime)
    time_out = Column(DateTime)
    total_hours = Column(Float)
    geo_in = Column(JSON)
    geo_out = Column(JSON)
    is_working_day = Column(Boolean, default=True)
    work_mode = Column(String, default="office")  # office/wfh/client/field/travel
    wfh_status = Column(String, default="n/a")    # pending_approval/approved/rejected/n/a
    approver_id = Column(String)
    approval_time = Column(DateTime)
    approval_notes = Column(String)
    meal_allowance = Column(Integer, default=0)
    extra_hours = Column(Float, default=0.0)
    notes = Column(JSON)
    status = Column(String, default="pending")
    created_at = Column(DateTime, server_default=func.now())

class Policy(Base):
    __tablename__ = "policies"
    id = Column(String, primary_key=True)
    title = Column(String)
    version = Column(String)
    category = Column(String)
    status = Column(String)  # draft/review/approved/published
    owner = Column(String)
    effective_date = Column(Date)
    file_url = Column(String)
    summary = Column(String)
    tags = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class PolicyAck(Base):
    __tablename__ = "policy_acks"
    id = Column(String, primary_key=True)
    policy_id = Column(String, ForeignKey("policies.id"))
    employee_id = Column(String)
    version = Column(String)
    ack_at = Column(DateTime)

class TemplateDoc(Base):
    __tablename__ = "templates"
    id = Column(String, primary_key=True)
    title = Column(String)
    category = Column(String)
    file_url = Column(String)
    description = Column(String)
    updated_at = Column(DateTime, server_default=func.now())