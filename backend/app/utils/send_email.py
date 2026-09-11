import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.configs.settings import Settings




def get_otp_email_template(otp: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                       style="background:#ffffff;border-radius:12px;padding:40px;">

                    <tr>
                        <td align="center">
                            <h2 style="margin:0;color:#111827;">
                                Verify Your Email
                            </h2>

                            <p style="margin:20px 0;color:#6b7280;font-size:16px;line-height:24px;">
                                Use the verification code below to complete your sign in.
                            </p>

                            <div style="
                                display:inline-block;
                                background:#111827;
                                color:#ffffff;
                                font-size:32px;
                                font-weight:bold;
                                letter-spacing:8px;
                                padding:18px 32px;
                                border-radius:10px;
                                margin:20px 0;
                            ">
                                {otp}
                            </div>

                            <p style="margin-top:20px;color:#6b7280;font-size:14px;">
                                This code will expire in <strong>10 minutes</strong>.
                            </p>

                            <p style="margin-top:32px;color:#9ca3af;font-size:13px;">
                                If you didn't request this code, you can safely ignore this email.
                            </p>

                        </td>
                    </tr>

                </table>

                <p style="margin-top:20px;color:#9ca3af;font-size:12px;">
                    © 2026 Your Company. All rights reserved.
                </p>

            </td>
        </tr>
    </table>

</body>
</html>
"""


def send_message_dependency(receiver_email: str, otp: str) -> dict:
    message = MIMEMultipart()
    message["Subject"] = f"Otp Verification for BudgetBuddy"
    message["From"] = Settings.SENDERS_EMAIL
    message["To"] = receiver_email   

    html_content = get_otp_email_template(otp)
    message.attach(MIMEText(html_content, "html"))


    try:
        with smtplib.SMTP(Settings.SMTP_SERVER, Settings.SMTP_PORT) as server:
            server.starttls()  # secure encryption TLS
            server.login(Settings.SENDERS_EMAIL, Settings.GMAIL_PASSWORD)
            server.sendmail(Settings.SENDERS_EMAIL, receiver_email, message.as_string()) 
            return {"message": "sent successfully"}
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")

if __name__ == "__main__":
    # Example usage
    receiver_email = "mandalsuvadwip@gmail.com"
    otp = "123456"
    result = send_message_dependency(receiver_email, otp)
    print(result)