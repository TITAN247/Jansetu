import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_SENDER = os.getenv('EMAIL_SENDER', '')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))


def _send_email(to_email, subject, html_body):
    """Core email sending function using SMTP."""
    if not EMAIL_SENDER or not EMAIL_PASSWORD:
        print(f"[EMAIL] Skipped (no credentials configured). To: {to_email}, Subject: {subject}")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f"JanSetu AI <{EMAIL_SENDER}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, to_email, msg.as_string())

        print(f"[EMAIL] Sent successfully to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to_email}: {e}")
        return False


def send_complaint_confirmation(to_email, ref_id, complaint_id):
    """Send complaint registration confirmation with ID."""
    subject = f"Complaint Registered — {ref_id} | JanSetu AI"
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #F6F8FC;">
        <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(14,26,51,0.06);">
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: #e6f4ea; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✅</div>
            </div>
            <h2 style="text-align: center; color: #0E1A33; font-size: 22px; margin-bottom: 8px;">Complaint Registered</h2>
            <p style="text-align: center; color: #4A5B7A; font-size: 14px; margin-bottom: 24px;">
                Your complaint has been successfully submitted and routed to the relevant department.
            </p>
            <div style="background: #EAF2FF; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <div style="font-size: 11px; color: #4A5B7A; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;">YOUR COMPLAINT ID</div>
                <div style="font-size: 24px; font-weight: 700; color: #2B6BFF; letter-spacing: 0.05em;">{ref_id}</div>
            </div>
            <p style="color: #4A5B7A; font-size: 13px; line-height: 1.6; margin-bottom: 16px;">
                <strong>Save this ID</strong> — you can use it to track your complaint status anytime at our portal.
            </p>
            <p style="color: #4A5B7A; font-size: 13px; line-height: 1.6;">
                You will receive email updates as your complaint progresses through the resolution pipeline.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
                JanSetu AI — AI-Powered Civic Engagement Platform
            </p>
        </div>
    </div>
    """
    return _send_email(to_email, subject, html)


def send_status_update(to_email, ref_id, new_status, message=""):
    """Send complaint status change notification."""
    status_colors = {
        'Assigned': '#2B6BFF',
        'In Progress': '#FBBC04',
        'Resolved': '#34A853',
        'Verified': '#34A853',
        'Rejected': '#EA4335',
    }
    color = status_colors.get(new_status, '#4A5B7A')

    subject = f"Complaint {ref_id} — Status: {new_status} | JanSetu AI"
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #F6F8FC;">
        <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(14,26,51,0.06);">
            <h2 style="color: #0E1A33; font-size: 20px; margin-bottom: 8px;">Status Update</h2>
            <p style="color: #4A5B7A; font-size: 14px; margin-bottom: 20px;">
                Your complaint <strong>{ref_id}</strong> has been updated.
            </p>
            <div style="background: #F6F8FC; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: {color};"></div>
                <span style="font-size: 16px; font-weight: 700; color: {color};">{new_status}</span>
            </div>
            {f'<p style="color: #4A5B7A; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">{message}</p>' if message else ''}
            <p style="color: #4A5B7A; font-size: 13px;">
                Track full details on our portal using your Complaint ID.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
                JanSetu AI — AI-Powered Civic Engagement Platform
            </p>
        </div>
    </div>
    """
    return _send_email(to_email, subject, html)


def send_worker_assignment_email(to_email, worker_name, ref_id, category, priority, complaint_text=''):
    """Send email to worker when a task is assigned to them."""
    subject = f"New Task Assigned: {ref_id} | JanSetu AI"
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #F6F8FC;">
        <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(14,26,51,0.06);">
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: #EAF2FF; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">📌</div>
            </div>
            <h2 style="text-align: center; color: #0E1A33; font-size: 22px; margin-bottom: 8px;">New Task Assigned</h2>
            <p style="text-align: center; color: #4A5B7A; font-size: 14px; margin-bottom: 24px;">
                Hello <strong>{worker_name}</strong>, a new task has been assigned to you.
            </p>
            <div style="background: #EAF2FF; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 11px; color: #4A5B7A; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;">COMPLAINT ID</div>
                <div style="font-size: 20px; font-weight: 700; color: #2B6BFF; margin-bottom: 12px;">{ref_id}</div>
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <div>
                        <div style="font-size: 10px; color: #4A5B7A; font-weight: 600; text-transform: uppercase;">Category</div>
                        <div style="font-size: 14px; font-weight: 600; color: #0E1A33;">{category}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: #4A5B7A; font-weight: 600; text-transform: uppercase;">Priority</div>
                        <div style="font-size: 14px; font-weight: 600; color: {'#e74c3c' if priority == 'High' else '#e67e22' if priority == 'Medium' else '#2ecc71'};">{priority}</div>
                    </div>
                </div>
            </div>
            {f'<p style="color: #4A5B7A; font-size: 13px; line-height: 1.6; margin-bottom: 16px; border-left: 3px solid #2B6BFF; padding-left: 12px;">{complaint_text[:200]}{"..." if len(complaint_text) > 200 else ""}</p>' if complaint_text else ''}
            <p style="color: #4A5B7A; font-size: 13px; line-height: 1.6;">
                Please login to your <strong>Worker Dashboard</strong> to accept and begin working on this task.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
                JanSetu AI — AI-Powered Civic Engagement Platform
            </p>
        </div>
    </div>
    """
    return _send_email(to_email, subject, html)


def send_authority_no_worker_alert(officer_email, officer_name, ref_id, category, priority, department):
    """Send email to dept officer / admin when no worker is available for auto-assignment."""
    subject = f"⚠️ Manual Intervention Required: {ref_id} | JanSetu AI"
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #FFF8F0;">
        <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(14,26,51,0.06); border-left: 4px solid #e74c3c;">
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: #fef2f2; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">⚠️</div>
            </div>
            <h2 style="text-align: center; color: #0E1A33; font-size: 22px; margin-bottom: 8px;">Manual Assignment Needed</h2>
            <p style="text-align: center; color: #4A5B7A; font-size: 14px; margin-bottom: 24px;">
                Hello <strong>{officer_name}</strong>, the AI auto-assignment system could not find an available worker for the following complaint.
            </p>
            <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 11px; color: #4A5B7A; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;">COMPLAINT REQUIRING ATTENTION</div>
                <div style="font-size: 20px; font-weight: 700; color: #e74c3c; margin-bottom: 12px;">{ref_id}</div>
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <div>
                        <div style="font-size: 10px; color: #4A5B7A; font-weight: 600; text-transform: uppercase;">Department</div>
                        <div style="font-size: 14px; font-weight: 600; color: #0E1A33;">{department}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: #4A5B7A; font-weight: 600; text-transform: uppercase;">Category</div>
                        <div style="font-size: 14px; font-weight: 600; color: #0E1A33;">{category}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: #4A5B7A; font-weight: 600; text-transform: uppercase;">Priority</div>
                        <div style="font-size: 14px; font-weight: 600; color: {'#e74c3c' if priority == 'High' else '#e67e22' if priority == 'Medium' else '#2ecc71'};">{priority}</div>
                    </div>
                </div>
            </div>
            <p style="color: #e74c3c; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
                Reason: No available workers found in the {department} department.
            </p>
            <p style="color: #4A5B7A; font-size: 13px; line-height: 1.6;">
                Please login to your <strong>Department Officer Dashboard</strong> and manually assign this task to a worker.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
                JanSetu AI — AI-Powered Civic Engagement Platform
            </p>
        </div>
    </div>
    """
    return _send_email(officer_email, subject, html)


def send_escalation_alert(officer_email, officer_name, ref_id, category,
                          priority, department, minutes_pending, assigned_to=None):
    """
    Send an escalation alert to a dept officer.
    - assigned_to=None  → complaint is STILL unassigned (urgent red)
    - assigned_to=name  → complaint was just auto-assigned after escalation (amber)
    """
    resolved = assigned_to is not None
    # Import threshold for display — safe fallback if not available
    try:
        from services.escalation_service import ESCALATION_MINUTES as _ESC_MIN
    except Exception:
        _ESC_MIN = 3
    accent   = '#f59e0b' if resolved else '#dc2626'   # amber vs red
    bg_light = '#fffbeb' if resolved else '#fef2f2'
    icon     = '⚡' if resolved else '🚨'
    status_label = f'Auto-assigned to <strong>{assigned_to}</strong>' if resolved else 'Still Unassigned — Immediate Action Required'
    subject  = (
        f"{'[RESOLVED] ' if resolved else '[ESCALATION] '}Complaint {ref_id} "
        f"pending {minutes_pending} min | JanSetu AI"
    )

    hours   = minutes_pending // 60
    mins    = minutes_pending % 60
    time_str = f"{hours}h {mins}m" if hours else f"{mins} min"

    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 580px; margin: 0 auto;
                padding: 32px; background: {bg_light};">
        <div style="background: white; border-radius: 20px; padding: 32px;
                    box-shadow: 0 4px 20px rgba(14,26,51,0.08);
                    border-top: 4px solid {accent};">

            <!-- Icon + Title -->
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 64px; height: 64px; border-radius: 50%;
                            background: {bg_light}; display: inline-flex;
                            align-items: center; justify-content: center; font-size: 30px;">
                    {icon}
                </div>
            </div>
            <h2 style="text-align: center; color: #0E1A33; font-size: 22px; margin-bottom: 6px;">
                {'Escalation Resolved' if resolved else 'Complaint Escalation Alert'}
            </h2>
            <p style="text-align: center; color: #4A5B7A; font-size: 14px; margin-bottom: 28px;">
                Hello <strong>{officer_name}</strong>,
                {'a previously stuck complaint has been auto-assigned.' if resolved
                 else 'a complaint has exceeded the pending time limit and requires your immediate attention.'}
            </p>

            <!-- Complaint Card -->
            <div style="background: {bg_light}; border-radius: 14px; padding: 20px; margin-bottom: 24px;
                        border: 1px solid {accent}33;">
                <div style="font-size: 11px; color: #6b7280; font-weight: 700;
                            text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                    COMPLAINT REFERENCE
                </div>
                <div style="font-size: 22px; font-weight: 800; color: {accent}; margin-bottom: 16px;">
                    {ref_id}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                    <div>
                        <div style="font-size: 10px; color: #6b7280; font-weight: 700;
                                    text-transform: uppercase; margin-bottom: 3px;">Category</div>
                        <div style="font-size: 13px; font-weight: 600; color: #111827;">{category}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: #6b7280; font-weight: 700;
                                    text-transform: uppercase; margin-bottom: 3px;">Priority</div>
                        <div style="font-size: 13px; font-weight: 700;
                                    color: {'#dc2626' if priority == 'High' else '#f59e0b' if priority == 'Medium' else '#16a34a'};">
                            {priority}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: #6b7280; font-weight: 700;
                                    text-transform: uppercase; margin-bottom: 3px;">Time Pending</div>
                        <div style="font-size: 13px; font-weight: 700; color: {accent};">{time_str}</div>
                    </div>
                </div>
            </div>

            <!-- Status Banner -->
            <div style="background: {'#f0fdf4' if resolved else '#fef2f2'}; border-radius: 12px;
                        padding: 14px 18px; margin-bottom: 24px;
                        border-left: 4px solid {accent};">
                <div style="font-size: 13px; font-weight: 600;
                            color: {'#15803d' if resolved else '#dc2626'};">
                    Status: {status_label}
                </div>
                {'<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">No further action needed — the system handled this automatically.</div>' if resolved
                 else '<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Please log in to your dashboard and manually assign this complaint to an available worker.</div>'}
            </div>

            <p style="color: #6b7280; font-size: 12px; line-height: 1.6;">
                This alert was triggered automatically by the JanSetu AI Escalation Engine
                after the complaint exceeded the {_ESC_MIN}-minute pending threshold.
            </p>

            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">
                JanSetu AI — AI-Powered Civic Engagement Platform
            </p>
        </div>
    </div>
    """
    return _send_email(officer_email, subject, html)
