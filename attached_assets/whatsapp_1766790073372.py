import os, requests
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_TOKEN = os.getenv("TWILIO_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
def send_whatsapp(to_e164, body):
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/Messages.json"
    data = {"From": TWILIO_WHATSAPP_FROM, "To": f"whatsapp:{to_e164}", "Body": body}
    r = requests.post(url, data=data, auth=(TWILIO_SID, TWILIO_TOKEN))
    r.raise_for_status()