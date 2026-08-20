import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import resend

from app.configs.settings import Settings

logger = logging.getLogger(__name__)

def get_otp_email_template(otp: str, purpose: str = "verification") -> str:
    if purpose == "password_reset":
        title = "Reset Your Password"
        subtitle = "Use the verification code below to reset your BudgetBuddy password."
        subject_icon = "🔐"
    else:
        title = "Verify Your Email"
        subtitle = "Use the verification code below to complete your sign in to BudgetBuddy."
        subject_icon = "✨"

    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="560" cellpadding="0" cellspacing="0"
                       style="background:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);">

                    <tr>
                        <td align="center">
                            <div style="width:48px;height:48px;background:rgba(99,102,241,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:24px;line-height:48px;text-align:center;">
                                {subject_icon}
                            </div>
                            <h2 style="margin:0;color:#f8fafc;font-size:24px;font-weight:700;">
                                {title}
                            </h2>

                            <p style="margin:16px 0 24px 0;color:#94a3b8;font-size:15px;line-height:24px;">
                                {subtitle}
                            </p>

                            <div style="
                                display:inline-block;
                                background:#090d16;
                                color:#818cf8;
                                font-size:32px;
                                font-weight:bold;
                                letter-spacing:10px;
                                padding:16px 36px;
                                border-radius:12px;
                                border:1px solid #4338ca;
                                margin:12px 0 24px 0;
                            ">
                                {otp}
                            </div>

                            <p style="margin:0;color:#64748b;font-size:13px;">
                                This code will expire in <strong style="color:#94a3b8;">10 minutes</strong>.
                            </p>

                            <p style="margin-top:28px;color:#475569;font-size:12px;border-top:1px solid #334155;padding-top:20px;">
                                If you did not request this code, you can safely ignore this email. Your account remains secure.
                            </p>

                        </td>
                    </tr>

                </table>

                <p style="margin-top:24px;color:#475569;font-size:12px;">
                    © 2026 BudgetBuddy. All rights reserved.
                </p>

            </td>
        </tr>
    </table>

</body>
</html>
"""

def send_smtp_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send email via SMTP as fallback."""
    if not (Settings.SMTP_SERVER and Settings.SENDERS_EMAIL and Settings.GMAIL_PASSWORD):
        logger.warning("SMTP configuration is incomplete.")
        return False
    try:
        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = Settings.SENDERS_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(Settings.SMTP_SERVER, Settings.SMTP_PORT) as server:
            server.starttls()
            server.login(Settings.SENDERS_EMAIL, Settings.GMAIL_PASSWORD)
            server.sendmail(Settings.SENDERS_EMAIL, to_email, msg.as_string())
        logger.info(f"Email successfully sent via SMTP to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP: {e}")
        return False

def send_email(otp: str, recipient_email: str, purpose: str = "verification"):
    """Send OTP email using Resend with fallback to SMTP."""
    html_content = get_otp_email_template(otp, purpose=purpose)
    subject = "Reset Your Password | BudgetBuddy OTP" if purpose == "password_reset" else "Email Verification | BudgetBuddy OTP"

    # 1. Try Resend if configured
    if Settings.RESEND_API_KEY:
        try:
            resend.api_key = Settings.RESEND_API_KEY
            params: resend.Emails.SendParams = {
                "from": "bb@developerabhishek.me",
                "to": recipient_email,
                "subject": subject,
                "html": html_content,
            }
            resend.Emails.send(params)
            logger.info(f"Email successfully sent via Resend to {recipient_email}")
            return
        except Exception as e:
            logger.warning(f"Resend send failed: {e}. Attempting SMTP fallback...")

    # 2. Fallback to SMTP
    smtp_sent = send_smtp_email(recipient_email, subject, html_content)
    if not smtp_sent:
        logger.error(f"All email dispatch methods failed for {recipient_email}")