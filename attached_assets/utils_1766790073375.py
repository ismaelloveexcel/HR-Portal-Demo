import uuid
from .models import AuditLog

def make_id(): return str(uuid.uuid4())

def log_action(db, actor, action, entity_type, entity_id, metadata=None):
    rec = AuditLog(id=make_id(), actor=actor, action=action,
                   entity_type=entity_type, entity_id=entity_id,
                   metadata=metadata or {})
    db.add(rec); db.commit()