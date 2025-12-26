from datetime import datetime, timedelta
def make_ics(summary, description, start_dt: datetime, duration_minutes=30, location=""):
    end_dt = start_dt + timedelta(minutes=duration_minutes)
    fmt = lambda dt: dt.strftime("%Y%m%dT%H%M%SZ")
    return f"""BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:{summary}
DESCRIPTION:{description}
DTSTART:{fmt(start_dt)}
DTEND:{fmt(end_dt)}
LOCATION:{location}
END:VEVENT
END:VCALENDAR
"""