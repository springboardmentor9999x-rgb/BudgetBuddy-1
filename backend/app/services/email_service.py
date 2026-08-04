import secrets
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings


# ==========================================
# GENERATE 6-DIGIT OTP
# ==========================================

def generate_verification_code() -> str:
    """
    Generate a secure 6-digit verification code.
    """

    return f"{secrets.randbelow(1_000_000):06d}"


# ==========================================
# SEND VERIFICATION EMAIL
# ==========================================

def send_verification_email(
    recipient_email: str,
    verification_code: str
) -> None:

    # ------------------------------------------
    # Check SMTP configuration
    # ------------------------------------------

    if not settings.SMTP_USER:
        raise RuntimeError(
            "SMTP_USER is not configured in .env"
        )

    if not settings.SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_PASSWORD is not configured in .env"
        )

    sender_email = (
        settings.EMAIL_FROM
        or settings.SMTP_USER
    )

    # Safe debug information.
    # Password is NEVER printed.
    print("====================================")
    print("BUDGET BUDDY EMAIL DEBUG")
    print("SMTP Host:", settings.SMTP_HOST)
    print("SMTP Port:", settings.SMTP_PORT)
    print("SMTP User configured:", bool(settings.SMTP_USER))
    print("SMTP Password configured:", bool(settings.SMTP_PASSWORD))
    print("Sender configured:", bool(sender_email))
    print("====================================")

    # ------------------------------------------
    # CREATE EMAIL
    # ------------------------------------------

    message = MIMEMultipart("alternative")

    message["Subject"] = (
        f"{verification_code} is your "
        "Budget Buddy verification code"
    )

    message["From"] = sender_email
    message["To"] = recipient_email

    # ==========================================
    # PLAIN TEXT VERSION
    # ==========================================

    text_content = f"""
Welcome to Budget Buddy!

Your email verification code is:

{verification_code}

This verification code expires in 10 minutes.

If you did not create a Budget Buddy account,
you can safely ignore this email.

Budget Buddy
Smarter money starts here.
"""

    # ==========================================
    # HTML EMAIL VERSION
    # ==========================================

    html_content = f"""
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

</head>

<body
style="
margin:0;
padding:0;
background:#EEF4F2;
font-family:Arial, Helvetica, sans-serif;
"
>

<table
role="presentation"
width="100%"
cellspacing="0"
cellpadding="0"
border="0"
style="
background:#EEF4F2;
padding:40px 15px;
"
>

<tr>

<td align="center">

<table
role="presentation"
width="100%"
cellspacing="0"
cellpadding="0"
border="0"
style="
max-width:560px;
background:#FFFFFF;
border-radius:20px;
overflow:hidden;
box-shadow:0 15px 40px rgba(7,26,43,0.10);
"
>

<!-- ===================================
     HEADER
=================================== -->

<tr>

<td
style="
background:#071A2B;
padding:30px 36px;
"
>

<table
role="presentation"
cellspacing="0"
cellpadding="0"
border="0"
>

<tr>

<td
style="
width:42px;
height:42px;
background:#34D399;
border-radius:12px;
text-align:center;
vertical-align:middle;
font-size:20px;
"
>

&#128179;

</td>

<td
style="
padding-left:12px;
color:#FFFFFF;
font-size:20px;
font-weight:bold;
"
>

Budget Buddy

</td>

</tr>

</table>

</td>

</tr>


<!-- ===================================
     CONTENT
=================================== -->

<tr>

<td
style="
padding:40px 36px;
"
>

<p
style="
margin:0;
color:#10B981;
font-size:12px;
font-weight:bold;
letter-spacing:2px;
text-transform:uppercase;
"
>

EMAIL VERIFICATION

</p>


<h1
style="
margin:12px 0 0;
color:#071A2B;
font-size:28px;
line-height:1.3;
"
>

Verify your email

</h1>


<p
style="
margin:14px 0 0;
color:#64748B;
font-size:15px;
line-height:1.7;
"
>

Welcome to Budget Buddy.

Enter the verification code below
to finish setting up your account.

</p>


<!-- ===================================
     OTP BOX
=================================== -->

<div
style="
margin:30px 0;
padding:24px;
background:#ECFDF5;
border:1px solid #D1FAE5;
border-radius:14px;
text-align:center;
"
>

<p
style="
margin:0 0 12px;
color:#64748B;
font-size:12px;
font-weight:bold;
text-transform:uppercase;
letter-spacing:1px;
"
>

Your verification code

</p>


<div
style="
color:#071A2B;
font-size:36px;
font-weight:bold;
letter-spacing:10px;
"
>

{verification_code}

</div>

</div>


<!-- ===================================
     EXPIRY
=================================== -->

<p
style="
margin:0;
color:#64748B;
font-size:13px;
line-height:1.6;
"
>

This code will expire in

<strong
style="
color:#071A2B;
"
>

10 minutes

</strong>.

</p>


<!-- ===================================
     SECURITY MESSAGE
=================================== -->

<p
style="
margin:22px 0 0;
color:#94A3B8;
font-size:12px;
line-height:1.6;
"
>

If you didn't create a Budget Buddy account,
you can safely ignore this email.

</p>

</td>

</tr>


<!-- ===================================
     FOOTER
=================================== -->

<tr>

<td
style="
border-top:1px solid #E2E8F0;
padding:22px 36px;
color:#94A3B8;
font-size:11px;
text-align:center;
"
>

© 2026 Budget Buddy · Smarter money starts here.

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
"""

    # ------------------------------------------
    # Attach text + HTML
    # ------------------------------------------

    message.attach(
        MIMEText(
            text_content,
            "plain",
            "utf-8"
        )
    )

    message.attach(
        MIMEText(
            html_content,
            "html",
            "utf-8"
        )
    )

    # ==========================================
    # SEND THROUGH GMAIL SMTP
    # ==========================================

    try:

        print("Connecting to Gmail SMTP...")

        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=20
        ) as server:

            # Identify ourselves to SMTP server
            server.ehlo()

            print("Starting TLS...")

            # Secure connection
            server.starttls()

            server.ehlo()

            print("TLS started successfully.")

            print("Logging into Gmail...")

            # Gmail authentication
            server.login(
                settings.SMTP_USER,
                settings.SMTP_PASSWORD
            )

            print("Gmail authentication successful.")

            print("Sending verification email...")

            server.sendmail(
                sender_email,
                recipient_email,
                message.as_string()
            )

            print("Verification email sent successfully.")


    # ==========================================
    # AUTHENTICATION ERROR
    # ==========================================

    except smtplib.SMTPAuthenticationError as exc:

        print("")
        print("SMTP AUTHENTICATION ERROR")
        print(type(exc).__name__)
        print(str(exc))
        print("")

        raise RuntimeError(
            "Gmail authentication failed. "
            "Check SMTP_USER and your Google App Password."
        ) from exc


    # ==========================================
    # SMTP ERROR
    # ==========================================

    except smtplib.SMTPException as exc:

        print("")
        print("SMTP ERROR")
        print(type(exc).__name__)
        print(str(exc))
        print("")

        raise RuntimeError(
            f"SMTP error: {type(exc).__name__}: {exc}"
        ) from exc


    # ==========================================
    # OTHER ERRORS
    # ==========================================

    except Exception as exc:

        print("")
        print("EMAIL ERROR")
        print(type(exc).__name__)
        print(str(exc))
        print("")

        raise RuntimeError(
            f"Email error: {type(exc).__name__}: {exc}"
        ) from exc