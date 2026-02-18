"""
Smart AI-based Worker Assignment Service
=========================================
Assigns tasks to the least-loaded eligible worker using a
Smart Worker Capacity Model with a configurable hard limit.

Assignment Logic:
  1. Fetch all active workers in the department.
  2. Calculate each worker's active task count (Assigned + In Progress).
  3. Filter to workers BELOW the HARD_LIMIT (eligible pool).
  4. Among eligible workers, pick the one with the lowest load.
     Ties are broken randomly for fairness.
  5. HIGH PRIORITY OVERRIDE: If no eligible workers exist but the
     complaint is High priority, assign to the globally least-loaded
     worker anyway and log the override.
  6. If no workers exist at all, or all are at capacity and priority
     is not High, return failure → caller triggers authority alert.
"""

from database.mongo import get_db
from bson.objectid import ObjectId
import random
import datetime

# ─────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────
# Maximum active tasks a worker may hold before being excluded
# from normal auto-assignment. Adjust here to change system-wide.
HARD_LIMIT = 7

# Statuses that count toward a worker's active load
ACTIVE_STATUSES = ['Assigned', 'In Progress']


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def get_worker_load(db, worker_id: str) -> int:
    """Return the number of active tasks currently held by a worker."""
    return db.complaints.count_documents({
        'worker_id': worker_id,
        'status': {'$in': ACTIVE_STATUSES}
    })


def _resolve_dept_variants(department: str) -> list:
    """Expand a department name to include known legacy variants."""
    variants = {
        'Road':        ['Road Department'],
        'Water':       ['Water Department'],
        'Electricity': ['Electricity Department'],
        'Sanitation':  ['Sanitation Department'],
    }
    search = [department]
    search.extend(variants.get(department, []))
    return search


def get_worker_pool(db, department: str) -> list:
    """
    Return all active workers in the department, each annotated with:
      - active_tasks  : current load
      - total_completed : historical resolved count
      - at_capacity   : True if active_tasks >= HARD_LIMIT
    Sorted ascending by active_tasks (least loaded first).
    """
    search_depts = _resolve_dept_variants(department)

    workers = list(db.workers.find({
        'department_id': {'$in': search_depts},
        'is_active':     {'$ne': False}
    }))

    if not workers:
        return []

    pool = []
    for w in workers:
        w_id = str(w['_id'])
        active_tasks = get_worker_load(db, w_id)
        total_completed = db.complaints.count_documents({
            'worker_id': w_id,
            'status':    {'$in': ['Resolved', 'Verified']}
        })
        pool.append({
            'worker':          w,
            'worker_id':       w_id,
            'active_tasks':    active_tasks,
            'total_completed': total_completed,
            'name':            w.get('name', 'Worker'),
            'at_capacity':     active_tasks >= HARD_LIMIT,
        })

    pool.sort(key=lambda x: x['active_tasks'])
    return pool


def _pick_least_loaded(candidates: list) -> dict:
    """
    From a list of worker dicts (already sorted ascending by active_tasks),
    pick randomly among those sharing the minimum load.
    """
    min_load = candidates[0]['active_tasks']
    tied = [c for c in candidates if c['active_tasks'] == min_load]
    return random.choice(tied)


def _log_override(db, complaint_id: str, worker_id: str,
                  worker_load: int, ref_id: str):
    """Persist a priority-override record to the DB for audit purposes."""
    db.assignment_overrides.insert_one({
        'complaint_id': complaint_id,
        'ref_id':       ref_id,
        'worker_id':    worker_id,
        'worker_load_at_override': worker_load,
        'hard_limit':   HARD_LIMIT,
        'reason':       'High priority complaint bypassed HARD_LIMIT',
        'timestamp':    datetime.datetime.utcnow(),
    })
    print(
        f"[OVERRIDE] High-priority complaint {ref_id} assigned to "
        f"worker {worker_id} at load {worker_load} "
        f"(HARD_LIMIT={HARD_LIMIT}). Override logged."
    )


# ─────────────────────────────────────────────────────────────
# MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────

def smart_assign(complaint_id: str, department: str, officer_id=None) -> dict:
    """
    Assign a complaint to the best available worker.

    Returns a dict with at minimum:
      { 'success': bool, ... }

    On success also includes:
      worker_id, worker_name, worker_load, capacity_override (bool)

    On failure:
      error (str), all_at_capacity (bool)
    """
    db = get_db()

    # ── 1. Fetch complaint ──────────────────────────────────
    try:
        complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
    except Exception:
        return {'success': False, 'error': 'Invalid complaint ID'}

    if not complaint:
        return {'success': False, 'error': 'Complaint not found'}

    ref_id   = complaint.get('ref_id', complaint_id)
    priority = complaint.get('priority', 'Medium')   # High / Medium / Low
    is_high_priority = (priority == 'High')

    # ── 2. Build worker pool ────────────────────────────────
    pool = get_worker_pool(db, department)

    if not pool:
        return {
            'success':         False,
            'error':           f'No workers registered in {department} department',
            'all_at_capacity': False,
        }

    # ── 3. Filter eligible workers (below HARD_LIMIT) ───────
    eligible = [w for w in pool if not w['at_capacity']]

    capacity_override = False

    if eligible:
        # Normal path: pick least-loaded eligible worker
        chosen = _pick_least_loaded(eligible)
        print(
            f"[SMART_ASSIGN] {ref_id} → {chosen['name']} "
            f"(load {chosen['active_tasks']}/{HARD_LIMIT})"
        )

    elif is_high_priority:
        # ── 4. Priority override: all at capacity but complaint is High ──
        # Assign to globally least-loaded worker (first in sorted pool)
        chosen = _pick_least_loaded(pool)
        capacity_override = True
        _log_override(db, complaint_id, chosen['worker_id'],
                      chosen['active_tasks'], ref_id)
        print(
            f"[SMART_ASSIGN][OVERRIDE] High-priority {ref_id} → "
            f"{chosen['name']} (load {chosen['active_tasks']}, "
            f"HARD_LIMIT={HARD_LIMIT} bypassed)"
        )

    else:
        # ── 5. All workers at capacity, normal priority → fail ──
        print(
            f"[SMART_ASSIGN] {ref_id} → All {len(pool)} workers at "
            f"capacity (≥{HARD_LIMIT} tasks). Staying Pending."
        )
        return {
            'success':         False,
            'error':           (
                f'All workers in {department} are at capacity '
                f'({HARD_LIMIT} active tasks). Manual assignment required.'
            ),
            'all_at_capacity': True,
            'worker_count':    len(pool),
            'hard_limit':      HARD_LIMIT,
        }

    chosen_worker_id = chosen['worker_id']
    chosen_name      = chosen['name']

    # ── 6. Persist assignment to DB ─────────────────────────
    update = {
        'worker_id':          chosen_worker_id,
        'status':             'Assigned',
        'assigned_by':        officer_id or 'AI_AUTO',
        'assignment_type':    'ai_smart' + ('_override' if capacity_override else ''),
        'capacity_override':  capacity_override,
        'timeline.assigned':  datetime.datetime.utcnow(),
        'last_updated':       datetime.datetime.utcnow(),
    }
    db.complaints.update_one(
        {'_id': ObjectId(complaint_id)},
        {'$set': update}
    )

    # ── 7. In-app notification to worker ────────────────────
    try:
        from services.notification_service import notification_service
        override_tag = ' [PRIORITY OVERRIDE]' if capacity_override else ''
        notification_service.notify(
            user_id=chosen_worker_id,
            message=(
                f"Smart-assigned task{override_tag}: {ref_id} "
                f"({complaint.get('category', 'General')} · {priority})"
            ),
            type='assignment'
        )
    except Exception as e:
        print(f"[SMART_ASSIGN] In-app notification error: {e}")

    # ── 8. Email the WORKER ─────────────────────────────────
    worker_email = chosen['worker'].get('email')
    if worker_email:
        try:
            from services.email_service import send_worker_assignment_email
            send_worker_assignment_email(
                to_email=worker_email,
                worker_name=chosen_name,
                ref_id=ref_id,
                category=complaint.get('category', 'General'),
                priority=priority,
                complaint_text=complaint.get(
                    'complaint_text', complaint.get('text', '')
                )
            )
        except Exception as e:
            print(f"[SMART_ASSIGN] Worker email error: {e}")

    # ── 9. Email the CITIZEN ────────────────────────────────
    if complaint.get('email'):
        try:
            from services.email_service import send_status_update
            send_status_update(
                complaint['email'],
                ref_id,
                'Assigned',
                f'Your complaint has been assigned to {chosen_name} for resolution.'
            )
        except Exception as e:
            print(f"[SMART_ASSIGN] Citizen email error: {e}")

    # ── 10. Return result ───────────────────────────────────
    return {
        'success':           True,
        'message':           (
            f'Smart-assigned to {chosen_name} '
            f'(Load: {chosen["active_tasks"]}/{HARD_LIMIT})'
            + (' [PRIORITY OVERRIDE]' if capacity_override else '')
        ),
        'worker_id':         chosen_worker_id,
        'worker_name':       chosen_name,
        'worker_load':       chosen['active_tasks'],
        'hard_limit':        HARD_LIMIT,
        'capacity_override': capacity_override,
        'all_at_capacity':   False,
    }
