"""
Escalation Service
==================
Background daemon that periodically scans for complaints stuck in "Pending"
status beyond a configurable time limit and escalates them.

Escalation flow:
  1. Every POLL_INTERVAL_SECONDS, query DB for Pending complaints older than
     ESCALATION_MINUTES with escalation_level == 0 (not yet escalated).
  2. Attempt smart re-assignment (capacity-aware).
  3. If assignment succeeds  → complaint moves to Assigned, escalation_level=1.
  4. If assignment still fails → mark escalation_level=1, email dept officers
     with an ESCALATION alert (different from the initial no-worker alert).
  5. Already-escalated complaints (level >= 1) are skipped to avoid spam.

Configuration
-------------
  ESCALATION_MINUTES   : Minutes a Pending complaint may sit before escalation.
                         Set to 3 for demo, 1440 (24 h) for production.
  POLL_INTERVAL_SECONDS: How often the scanner runs (default 60 s).
"""

import threading
import datetime
import time

# ─────────────────────────────────────────────────────────────
# CONFIGURATION  (change ESCALATION_MINUTES to 1440 for prod)
# ─────────────────────────────────────────────────────────────
ESCALATION_MINUTES    = 3        # ← 3 min for demo  |  1440 for 24-h production
POLL_INTERVAL_SECONDS = 60       # scanner cadence


def _get_overdue_pending(db) -> list:
    """Return Pending complaints whose created_at is older than ESCALATION_MINUTES."""
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=ESCALATION_MINUTES)
    return list(db.complaints.find({
        'status':           'Pending',
        'worker_id':        None,
        'escalation_level': {'$lt': 1},          # not yet escalated
        'created_at':       {'$lte': cutoff},
    }))


def _mark_escalated(db, complaint_id: str, reason: str):
    """Stamp the complaint as escalated in the DB."""
    db.complaints.update_one(
        {'_id': complaint_id},
        {'$set': {
            'escalation_level': 1,
            'escalation_reason': reason,
            'escalated_at':      datetime.datetime.utcnow(),
            'last_updated':      datetime.datetime.utcnow(),
        }}
    )


def _email_escalation_alert(officer_email: str, officer_name: str,
                             ref_id: str, category: str,
                             priority: str, department: str,
                             minutes_pending: int, assigned_to: str = None):
    """Send a rich escalation alert email to the dept officer."""
    try:
        from services.email_service import send_escalation_alert
        send_escalation_alert(
            officer_email=officer_email,
            officer_name=officer_name,
            ref_id=ref_id,
            category=category,
            priority=priority,
            department=department,
            minutes_pending=minutes_pending,
            assigned_to=assigned_to,
        )
    except Exception as e:
        print(f"[ESCALATION] Email error for {ref_id}: {e}")


def _run_escalation_scan():
    """Core scan logic — called on every poll tick."""
    # Import inside function to avoid circular imports at module load time
    from database.mongo import get_db
    from bson.objectid import ObjectId

    db = get_db()
    overdue = _get_overdue_pending(db)

    if not overdue:
        return

    print(f"[ESCALATION] {datetime.datetime.utcnow().isoformat()} — "
          f"Found {len(overdue)} overdue Pending complaint(s).")

    from services.smart_assignment import smart_assign

    for complaint in overdue:
        c_id      = str(complaint['_id'])
        ref_id    = complaint.get('ref_id', c_id)
        department = complaint.get('department', '')
        category  = complaint.get('category', 'General')
        priority  = complaint.get('priority', 'Medium')
        created   = complaint.get('created_at', datetime.datetime.utcnow())
        minutes_pending = int(
            (datetime.datetime.utcnow() - created).total_seconds() / 60
        )

        print(f"[ESCALATION] Processing {ref_id} — pending {minutes_pending} min.")

        # ── Attempt re-assignment ────────────────────────────
        assign_result = {}
        try:
            assign_result = smart_assign(c_id, department, officer_id='ESCALATION_ENGINE')
        except Exception as e:
            print(f"[ESCALATION] smart_assign error for {ref_id}: {e}")

        if assign_result.get('success'):
            worker_name = assign_result.get('worker_name', 'a worker')
            override_tag = ' [PRIORITY OVERRIDE]' if assign_result.get('capacity_override') else ''
            print(f"[ESCALATION] {ref_id} → Assigned to {worker_name}{override_tag} after escalation.")
            _mark_escalated(db, complaint['_id'], f'Auto-assigned after {minutes_pending} min pending.')

            # Notify dept officers that escalation resolved itself
            dept_officers = list(db.dept_officers.find({
                'department_id': {'$in': [department, f'{department} Department']}
            }))
            for officer in dept_officers:
                if officer.get('email'):
                    _email_escalation_alert(
                        officer_email=officer['email'],
                        officer_name=officer.get('name', 'Officer'),
                        ref_id=ref_id,
                        category=category,
                        priority=priority,
                        department=department,
                        minutes_pending=minutes_pending,
                        assigned_to=worker_name,
                    )
        else:
            # Still no worker — escalate and alert officer
            reason = assign_result.get('error', 'No eligible workers available.')
            print(f"[ESCALATION] {ref_id} → Still unassignable. Escalating. Reason: {reason}")
            _mark_escalated(db, complaint['_id'], reason)

            dept_officers = list(db.dept_officers.find({
                'department_id': {'$in': [department, f'{department} Department']}
            }))
            for officer in dept_officers:
                if officer.get('email'):
                    _email_escalation_alert(
                        officer_email=officer['email'],
                        officer_name=officer.get('name', 'Officer'),
                        ref_id=ref_id,
                        category=category,
                        priority=priority,
                        department=department,
                        minutes_pending=minutes_pending,
                        assigned_to=None,
                    )
            if not dept_officers:
                print(f"[ESCALATION] No dept officers found for {department}.")


def _escalation_loop():
    """Infinite loop that drives the escalation scanner."""
    print(f"[ESCALATION] Service started. "
          f"Threshold: {ESCALATION_MINUTES} min | Poll: {POLL_INTERVAL_SECONDS} s")
    while True:
        try:
            _run_escalation_scan()
        except Exception as e:
            print(f"[ESCALATION] Unexpected error in scan loop: {e}")
        time.sleep(POLL_INTERVAL_SECONDS)


def start_escalation_service():
    """
    Launch the escalation scanner as a background daemon thread.
    Call once from app.py after the DB is initialised.
    """
    t = threading.Thread(target=_escalation_loop, daemon=True, name='EscalationService')
    t.start()
    return t
