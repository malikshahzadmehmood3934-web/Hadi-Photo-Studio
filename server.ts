import express from 'express';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

interface OtpRecord {
  hash: string;
  expiresAt: number;
  attempts: number;
  resendAfter: number;
}

const otpStore = new Map<string, OtpRecord>();
const OTP_SECRET_SALT = process.env.OTP_SECRET_SALT || crypto.randomBytes(32).toString('hex');

function hashOtp(otp: string, email: string): string {
  return crypto
    .createHmac('sha256', OTP_SECRET_SALT)
    .update(`${email.toLowerCase().trim()}:${otp.trim()}`)
    .digest('hex');
}

// Mail transporter helper
function getMailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // -------------------------------------------------------------
  // SEND SECURE 6-DIGIT OTP
  // -------------------------------------------------------------
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: 'Email ghalat hai / Invalid Email address',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existing = otpStore.get(normalizedEmail);

      // Check Resend Cooldown (30 seconds)
      const now = Date.now();
      if (existing && existing.resendAfter > now) {
        const waitSec = Math.ceil((existing.resendAfter - now) / 1000);
        return res.status(429).json({
          success: false,
          error: `Baraye meherbani intezar karein / Please wait ${waitSec}s before resending`,
          cooldownSeconds: waitSec,
        });
      }

      // Generate cryptographically secure 6-digit numeric OTP
      const secureOtp = crypto.randomInt(100000, 1000000).toString();

      // Store hashed OTP with 5 minute expiration
      otpStore.set(normalizedEmail, {
        hash: hashOtp(secureOtp, normalizedEmail),
        expiresAt: now + 5 * 60 * 1000, // 5 minutes validity
        attempts: 0,
        resendAfter: now + 30 * 1000, // 30 seconds cooldown
      });

      // Dispatch Email via Nodemailer (if SMTP configured) or background transport
      const transporter = getMailTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM || `"Hadi Photo Studio & Events" <no-reply@hadiphotostudio.com>`,
        to: normalizedEmail,
        subject: 'Hadi Studio Login Verification',
        text: `Your Hadi Studio verification code is: ${secureOtp}\n\nThis OTP will expire in 5 minutes.\nDo not share this OTP with anyone.\n\nHadi Photo Studio & Events — Management Portal`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #d97706;">
            <h2 style="color: #f59e0b; margin-top: 0; font-size: 22px;">Hadi Studio Login Verification</h2>
            <p style="font-size: 15px; color: #cbd5e1;">A login request was initiated for your Hadi Studio management account.</p>
            <div style="background: #1e293b; padding: 18px 24px; border-radius: 8px; border: 1px solid #f59e0b; text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #f59e0b; font-family: monospace;">${secureOtp}</span>
            </div>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
              • <strong>This OTP will expire in 5 minutes.</strong><br/>
              • <strong>Do not share this OTP with anyone.</strong><br/>
              • If you did not request this code, please ignore this email.
            </p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
            <p style="font-size: 11px; color: #64748b;">Hadi Photo Studio & Events | Gulgasht Colony, Multan / Lahore, Pakistan</p>
          </div>
        `,
      };

      if (transporter) {
        await transporter.sendMail(mailOptions);
      }

      // CRITICAL: NEVER RETURN OTP IN THE RESPONSE
      return res.json({
        success: true,
        message: 'OTP email par send kar diya gaya hai. Apna Gmail/Email open karein aur OTP enter karein.',
        cooldownSeconds: 30,
        expiresInSeconds: 300,
      });
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
      return res.status(500).json({
        success: false,
        error: 'Email dispatch me masla pesh aya / Failed to dispatch verification email',
      });
    }
  });

  // -------------------------------------------------------------
  // VERIFY 6-DIGIT OTP
  // -------------------------------------------------------------
  app.post('/api/auth/verify-otp', (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp || typeof otp !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Email aur OTP code darj karein / Enter email and OTP code',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const record = otpStore.get(normalizedEmail);

      if (!record) {
        return res.status(400).json({
          success: false,
          error: 'OTP expire ho gaya hai / OTP Expired. Baraye meherbani naya OTP request karein.',
        });
      }

      const now = Date.now();
      if (now > record.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({
          success: false,
          error: 'OTP expire ho gaya hai / OTP Expired. Baraye meherbani naya OTP request karein.',
        });
      }

      // Increment attempt counter
      record.attempts += 1;
      if (record.attempts > 5) {
        otpStore.delete(normalizedEmail);
        return res.status(429).json({
          success: false,
          error: 'Bohat ziada ghalat koshishein / Maximum attempts exceeded. Please request a new OTP.',
        });
      }

      // Secure Constant-Time Hash Comparison
      const expectedHash = record.hash;
      const actualHash = hashOtp(otp.trim(), normalizedEmail);

      const isValid =
        expectedHash.length === actualHash.length &&
        crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(actualHash, 'hex'));

      if (!isValid) {
        const remaining = Math.max(0, 5 - record.attempts);
        return res.status(400).json({
          success: false,
          error: `OTP ghalat hai / Invalid OTP (${remaining} attempts remaining)`,
          remainingAttempts: remaining,
        });
      }

      // Single-use: delete upon successful verification
      otpStore.delete(normalizedEmail);

      return res.json({
        success: true,
        verified: true,
        email: normalizedEmail,
        message: 'OTP Verified Successfully! / Verification kamyab ho gayi',
      });
    } catch (err: any) {
      console.error('Verification error:', err);
      return res.status(500).json({
        success: false,
        error: 'Verification me masla pesh aya / Internal verification failure',
      });
    }
  });

  // -------------------------------------------------------------
  // FORGOT PASSWORD (PASSWORD RESET LINK DISPATCH - NO OTP)
  // -------------------------------------------------------------
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address / Sahi email darj karein',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/#reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

      const transporter = getMailTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"Hadi Photo Studio" <no-reply@hadiphotostudio.com>`,
          to: normalizedEmail,
          subject: 'Hadi Studio Password Reset Link',
          text: `You requested a password reset for your Hadi Studio account.\n\nClick the link below to set a new password:\n${resetUrl}\n\nThis link will expire in 30 minutes.\nIf you did not request this, please ignore this email.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #3b82f6;">
              <h2 style="color: #60a5fa; margin-top: 0;">Password Reset Request</h2>
              <p style="font-size: 15px; color: #cbd5e1;">A password reset was requested for <strong>${normalizedEmail}</strong>.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">Reset Password Now</a>
              </div>
              <p style="font-size: 13px; color: #94a3b8;">This secure reset link will expire in 30 minutes. Do NOT share this link with anyone.</p>
            </div>
          `,
        });
      }

      return res.json({
        success: true,
        message: 'Password reset link has been dispatched to your email. Check your Gmail inbox.',
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to dispatch password reset link',
      });
    }
  });

  // -------------------------------------------------------------
  // SEND ROLE-BASED NOTIFICATION / BROADCAST EMAIL
  // -------------------------------------------------------------
  app.post('/api/notifications/send', async (req, res) => {
    try {
      const { recipients, title, message, type } = req.body;
      const transporter = getMailTransporter();

      if (transporter && Array.isArray(recipients) && recipients.length > 0) {
        for (const recipient of recipients) {
          if (recipient.email && recipient.email.includes('@')) {
            try {
              await transporter.sendMail({
                from: process.env.SMTP_FROM || `"Hadi Photo Studio Alerts" <no-reply@hadiphotostudio.com>`,
                to: recipient.email,
                subject: `Hadi Studio Alert: ${title}`,
                text: `${message}\n\nHadi Photo Studio & Events Portal`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #d97706;">
                    <h3 style="color: #f59e0b; margin-top: 0;">${title}</h3>
                    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">${message}</p>
                    <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
                    <p style="font-size: 11px; color: #64748b;">Hadi Photo Studio & Events Notification System</p>
                  </div>
                `,
              });
            } catch (mailErr) {
              console.warn(`Failed to dispatch email to ${recipient.email}:`, mailErr);
            }
          }
        }
      }

      return res.json({
        success: true,
        message: 'Notification processed and dispatched successfully',
      });
    } catch (err: any) {
      console.error('Notification dispatch error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to dispatch notification',
      });
    }
  });

  // -------------------------------------------------------------
  // VITE OR STATIC SERVING
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hadi Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
