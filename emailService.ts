import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

const isPlaceholder = (val?: string): boolean => {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return (
    lower.includes('yourgmail@gmail.com') ||
    lower.includes('your_16_character_app_password') ||
    lower.includes('your_google_app_password') ||
    lower.includes('xxxxxxxxxxxxxxxx') ||
    lower === ''
  );
};

export const getTransporter = (): nodemailer.Transporter => {
  const gmailUser = (process.env.GMAIL_USER || process.env.SMTP_USER || '').trim();
  const rawPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '');
  const gmailAppPass = rawPass.replace(/\s+/g, '');

  const isConfigured = !isPlaceholder(gmailUser) && !isPlaceholder(gmailAppPass);

  if (isConfigured && gmailUser && gmailAppPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPass,
      },
    });
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && !isPlaceholder(process.env.SMTP_USER)) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

export const initEmailTransporter = () => {
  transporter = getTransporter();
  const gmailUser = (process.env.GMAIL_USER || process.env.SMTP_USER || '').trim();
  const rawPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '');
  const isConfigured = !isPlaceholder(gmailUser) && !isPlaceholder(rawPass);

  console.log('[EmailService] GMAIL_USER configured:', isConfigured, isConfigured ? `(${gmailUser})` : '');
  console.log('[EmailService] GMAIL_APP_PASSWORD configured:', isConfigured);

  if (isConfigured) {
    transporter.verify((err) => {
      if (err) {
        console.warn('[EmailService] Gmail SMTP verification warning:', err.message);
      } else {
        console.log(`[EmailService] Gmail SMTP connection verified successfully for ${gmailUser}!`);
      }
    });
  }
};

export interface EmailParams {
  to: string;
  subject: string;
  title: string;
  message: string;
  detailsHtml?: string;
  actionUrl?: string;
  actionText?: string;
}

export const sendNotificationEmail = async (params: EmailParams): Promise<{ success: boolean; liveDispatched: boolean }> => {
  try {
    if (!transporter) {
      initEmailTransporter();
    }

    const { to, subject, title, message, detailsHtml, actionUrl, actionText } = params;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 28px; border: 1px solid #334155; }
          .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: bold; color: #3b82f6; text-decoration: none; }
          .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
          .message { font-size: 15px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px; }
          .box { background: #0f172a; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #334155; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; text-align: center; }
          .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="brand">BudgetBuddy</span>
          </div>
          <div class="title">${title}</div>
          <div class="message">${message}</div>
          ${detailsHtml ? `<div class="box">${detailsHtml}</div>` : ''}
          ${
            actionUrl
              ? `<div style="text-align: center; margin-top: 24px;">
                  <a href="${actionUrl}" class="btn">${actionText || 'View Dashboard'}</a>
                </div>`
              : ''
          }
          <div class="footer">
            <p>This is an automated security & financial notification from BudgetBuddy.</p>
            <p>&copy; ${new Date().getFullYear()} BudgetBuddy Personal Finance Manager</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const fromAddress = process.env.GMAIL_USER && !isPlaceholder(process.env.GMAIL_USER)
      ? process.env.GMAIL_USER
      : 'alerts@budgetbuddy.app';

    const info = await transporter!.sendMail({
      from: `"BudgetBuddy" <${fromAddress}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`[EmailService] Notification email dispatched to ${to}: ${info?.messageId || 'Success'}`);
    return { success: true, liveDispatched: !isPlaceholder(process.env.GMAIL_USER) };
  } catch (error: any) {
    console.warn('[EmailService] Email notification fallback log:', error.message || error);
    return { success: true, liveDispatched: false };
  }
};

export const sendVerificationCodeEmail = async (params: {
  to: string;
  name: string;
  code: string;
}): Promise<{ success: boolean; liveDispatched: boolean }> => {
  const { to, name, code } = params;

  console.log('\n======================================================================');
  console.log('📧 [BUDGETBUDDY VERIFICATION CODE DISPATCH]');
  console.log(`To:   ${to.trim()}`);
  console.log(`Name: ${name || 'User'}`);
  console.log(`CODE: >>> ${code} <<<`);
  console.log('Expires in: 10 minutes');
  console.log('======================================================================\n');

  try {
    const activeTransporter = getTransporter();
    const gmailUser = (process.env.GMAIL_USER || process.env.SMTP_USER || '').trim();
    const isConfigured = !isPlaceholder(gmailUser) && !isPlaceholder(process.env.GMAIL_APP_PASSWORD);

    const subject = `Your BudgetBuddy Verification Code: ${code}`;
    const textContent = `Hello ${name || 'User'},\n\nYour BudgetBuddy verification code is: ${code}\n\nEnter this 6-digit code on the BudgetBuddy verification page to complete your sign-in.\n\nThis code will expire in 10 minutes.\n\nIf you did not request this verification code, please ignore this email.\n\nRegards,\nBudgetBuddy Team`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BudgetBuddy Verification Code</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 28px 32px; background-color: #0f172a; text-align: center;">
              <span style="font-size: 24px; font-weight: 800; color: #3b82f6; letter-spacing: -0.5px;">BudgetBuddy</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">Hello ${name || 'User'},</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #334155;">
                Your 6-digit BudgetBuddy verification code is:
              </p>
              <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'SFMono-Regular', Consolas, Menlo, Monaco, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8;">${code}</span>
                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for 10 minutes &bull; One-time use only</div>
              </div>
              <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #64748b;">
                Enter this code on the verification screen to complete your sign-in.
              </p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                If you did not request this verification code, no action is needed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 4px;">BudgetBuddy Personal Finance &bull; Security Notification</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} BudgetBuddy</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const fromAddress = isConfigured && gmailUser ? gmailUser : 'security@budgetbuddy.app';

    if (isConfigured) {
      const info = await activeTransporter.sendMail({
        from: `"BudgetBuddy Security" <${fromAddress}>`,
        replyTo: fromAddress,
        to: to.trim(),
        subject,
        text: textContent,
        html: htmlContent,
        priority: 'high',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          Importance: 'High',
        },
      });

      console.log('[EmailService] Live verification email sent to:', to.trim(), 'MessageID:', info?.messageId);
      return { success: true, liveDispatched: true };
    } else {
      console.log('[EmailService] Demo/Simulation mode: code generated and logged above.');
      return { success: true, liveDispatched: false };
    }
  } catch (error: any) {
    console.warn('[EmailService] Gmail SMTP delivery failed:', error.message || error);
    return { success: false, liveDispatched: false };
  }
};
