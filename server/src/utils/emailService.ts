import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure,
            auth: {
                user: config.email.auth.user,
                pass: config.email.auth.pass,
            },
        });
    }

    isConfigured(): boolean {
        return Boolean(config.email.auth.user && config.email.auth.pass);
    }

    getConfiguredFromAddress(): string {
        return (process.env.FROM || config.email.auth.user || '').trim().toLowerCase();
    }

    async verifyConnection(): Promise<boolean> {
        if (!this.isConfigured()) {
            logger.warn('SMTP verification skipped because SMTP is not configured');
            return false;
        }

        const smtpUser = (config.email.auth.user || '').trim().toLowerCase();
        const fromAddress = this.getConfiguredFromAddress();

        if (smtpUser && fromAddress && smtpUser !== fromAddress) {
            logger.warn('SMTP FROM address does not match authenticated SMTP user', {
                fromAddress,
                smtpUser,
            });
        }

        try {
            await this.transporter.verify();
            logger.info('SMTP connection verified successfully', {
                host: config.email.host,
                port: config.email.port,
                secure: config.email.secure,
                smtpUser,
                fromAddress,
            });
            return true;
        } catch (error) {
            logger.error('SMTP connection verification failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                host: config.email.host,
                port: config.email.port,
                secure: config.email.secure,
                smtpUser,
                fromAddress,
            });
            return false;
        }
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            if (!this.isConfigured()) {
                throw new Error('SMTP is not configured');
            }

            const mailOptions = {
                from: process.env.FROM
                    ? `"${process.env.FROM_NAME || 'JobFinder AI'}" <${process.env.FROM}>`
                    : `"JobFinder AI" <${config.email.auth.user}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };

            const info = await this.transporter.sendMail(mailOptions);

            logger.info('Email sent successfully', {
                messageId: info.messageId,
                to: options.to,
                subject: options.subject,
            });
        } catch (error) {
            logger.error('Failed to send email', {
                error: error instanceof Error ? error.message : 'Unknown error',
                to: options.to,
                subject: options.subject,
            });
            throw new Error('Failed to send email');
        }
    }

    async sendOTPEmail(email: string, otp: string, type: 'signup' | 'password-reset' = 'signup'): Promise<void> {
        const subject = type === 'signup' ? 'Verify Your Email - JobFinder AI' : 'Password Reset Code - JobFinder AI';
        const title = type === 'signup' ? 'Verify Your Email' : 'Reset Your Password';
        const message = type === 'signup'
            ? 'Thank you for signing up! Please use the code below to verify your email address.'
            : 'You requested a password reset. Please use the code below to reset your password.';

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
            .content { padding: 40px 20px; }
            .otp-container { background-color: #f1f5f9; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: 700; color: #3b82f6; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 JobFinder AI</h1>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">${title}</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">${message}</p>
              
              <div class="otp-container">
                <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="color: #64748b; margin: 10px 0 0 0; font-size: 14px;">This code will expire in 5 minutes</p>
              </div>
              
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                If you didn't request this code, please ignore this email or contact our support team.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 JobFinder AI. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const text = `
      ${title}
      
      ${message}
      
      Your verification code is: ${otp}
      
      This code will expire in 5 minutes.
      
      If you didn't request this code, please ignore this email.
      
      © 2024 JobFinder AI. All rights reserved.
    `;

        await this.sendEmail({
            to: email,
            subject,
            html,
            text,
        });
    }

    async sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
        const subject = 'Welcome to JobFinder AI! 🎉';
        const roleMessage = role === 'jobseeker'
            ? 'Start exploring thousands of job opportunities tailored just for you!'
            : 'Begin posting jobs and finding the perfect candidates for your team!';

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
            .content { padding: 40px 20px; }
            .welcome-box { background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 JobFinder AI</h1>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Welcome aboard, ${name}! 🎉</h2>
              
              <div class="welcome-box">
                <h3 style="color: #3b82f6; margin: 0 0 15px 0;">Your account is ready!</h3>
                <p style="color: #475569; margin: 0; font-size: 16px;">${roleMessage}</p>
              </div>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                You're now part of a community that's revolutionizing the way people find jobs and hire talent. 
                Our AI-powered platform is designed to make your ${role === 'jobseeker' ? 'job search' : 'hiring process'} 
                more efficient and successful.
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="button">Get Started Now</a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                Need help getting started? Our support team is here to help you every step of the way.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 JobFinder AI. All rights reserved.</p>
              <p>You're receiving this email because you created an account with us.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        await this.sendEmail({
            to: email,
            subject,
            html,
        });
    }

    async sendJobMatchAlert(email: string, name: string, job: { title: string; company: string; location?: string; type?: string; salary?: string }): Promise<void> {
        const subject = `New Job Match for You: ${job.title}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e2e8f0;">
            <h1 style="margin:0 0 12px 0;font-size:24px;">A new job matches your preferences</h1>
            <p style="margin:0 0 20px 0;color:#475569;">Hi ${name}, we found a newly posted role that matches your profile by 80% or more.</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
              <p style="margin:0 0 8px 0;font-size:20px;font-weight:700;">${job.title}</p>
              <p style="margin:0 0 8px 0;color:#334155;">${job.company}</p>
              <p style="margin:0;color:#64748b;">${job.location || 'Location not specified'}${job.type ? ` • ${job.type}` : ''}${job.salary ? ` • ${job.salary}` : ''}</p>
            </div>
            <p style="margin:20px 0 0 0;color:#475569;">Open JobFinder AI to review the full posting and apply.</p>
          </div>
        </body>
      </html>
    `;

        const text = `Hi ${name}, a new job matches your preferences by 80% or more.\n\n${job.title}\n${job.company}\n${job.location || 'Location not specified'}${job.type ? ` | ${job.type}` : ''}${job.salary ? ` | ${job.salary}` : ''}\n\nOpen JobFinder AI to review and apply.`;

        await this.sendEmail({ to: email, subject, html, text });
    }
}

export default new EmailService();
