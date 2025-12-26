import os, requests
RESEND_KEY = os.getenv("RESEND_KEY")
def send_email(to, subject, html, ics_content=None):
    headers = {"Authorization": f"Bearer {RESEND_KEY}", "Content-Type": "application/json"}
    payload = {"from": "hr@yourdomain.com", "to": [to], "subject": subject, "html": html}
    r = requests.post("https://api.resend.com/emails", headers=headers, json=payload)
    r.raise_for_status()