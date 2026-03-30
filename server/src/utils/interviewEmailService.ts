import mongoose from 'mongoose';
import emailService from './emailService';
import logger from './logger';
import User from '../models/Users';

type RecipientRole = 'candidate' | 'employer';

type InterviewEmailPayload = {
  to: string;
  recipientName: string;
  role: RecipientRole;
  counterpartName: string;
  jobTitle: string;
  company: string;
  scheduledAt: Date;
  duration: number;
  type: 'video' | 'phone' | 'in-person';
  notes?: string;
  meetingLink?: string;
  location?: string;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);

const formatType = (type: InterviewEmailPayload['type']) =>
  type === 'in-person' ? 'In-person' : type === 'video' ? 'Video' : 'Phone';

const buildDetailsHtml = (payload: InterviewEmailPayload) => {
  const detailLabel = payload.type === 'in-person'
    ? 'Location'
    : payload.type === 'phone'
      ? 'Call details'
      : 'Meeting link';
  const detailValue = payload.type === 'in-person'
    ? payload.location || 'Shared in the app'
    : payload.meetingLink || payload.location || 'Shared in the app';

  return `
    <ul style="padding-left:18px;color:#475569;line-height:1.7;">
      <li><strong>Role:</strong> ${payload.jobTitle} at ${payload.company}</li>
      <li><strong>Date:</strong> ${formatDate(payload.scheduledAt)}</li>
      <li><strong>Duration:</strong> ${payload.duration} minutes</li>
      <li><strong>Interview type:</strong> ${formatType(payload.type)}</li>
      <li><strong>${detailLabel}:</strong> ${detailValue}</li>
      ${payload.notes ? `<li><strong>Notes:</strong> ${payload.notes}</li>` : ''}
    </ul>
  `;
};

const sendInterviewEmail = async (
  payload: InterviewEmailPayload,
  subject: string,
  heading: string,
  intro: string,
) => {
  await emailService.sendEmail({
    to: payload.to,
    subject,
    html: `
      <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f8fafc;padding:24px;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#2563eb,#0f766e);padding:28px 24px;color:#fff;">
            <h1 style="margin:0;font-size:24px;">${heading}</h1>
            <p style="margin:10px 0 0;opacity:0.92;">JobFinder AI interview update</p>
          </div>
          <div style="padding:28px 24px;">
            <p style="color:#0f172a;font-size:16px;">Hi ${payload.recipientName},</p>
            <p style="color:#475569;font-size:15px;line-height:1.7;">${intro}</p>
            <div style="margin:20px 0;padding:18px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;">
              ${buildDetailsHtml(payload)}
            </div>
            <p style="color:#64748b;font-size:13px;line-height:1.6;">This email was sent because interview email notifications are enabled for your account.</p>
          </div>
        </div>
      </div>
    `,
    text: `${heading}\n\n${intro}\n\n${payload.jobTitle} at ${payload.company}\n${formatDate(payload.scheduledAt)}\n${payload.duration} minutes\n${formatType(payload.type)}`,
  });
};

export async function sendInterviewLifecycleEmails(params: {
  candidateId: mongoose.Types.ObjectId | string;
  employerId: mongoose.Types.ObjectId | string;
  candidateName: string;
  employerName: string;
  jobTitle: string;
  company: string;
  scheduledAt: Date;
  duration: number;
  type: 'video' | 'phone' | 'in-person';
  notes?: string;
  meetingLink?: string;
  location?: string;
  action: 'scheduled' | 'updated' | 'cancelled' | 'rescheduled';
}) {
  if (!emailService.isConfigured()) {
    logger.warn('Interview lifecycle email skipped because SMTP is not configured');
    return;
  }

  const [candidate, employer] = await Promise.all([
    User.findById(params.candidateId).select('email name preferences'),
    User.findById(params.employerId).select('email name preferences'),
  ]);

  const recipients = [
    {
      enabled: Boolean(candidate?.email && candidate?.preferences?.notifications?.email !== false),
      payload: candidate && {
        to: candidate.email,
        recipientName: candidate.name || params.candidateName,
        role: 'candidate' as const,
        counterpartName: params.employerName,
        jobTitle: params.jobTitle,
        company: params.company,
        scheduledAt: params.scheduledAt,
        duration: params.duration,
        type: params.type,
        notes: params.notes,
        meetingLink: params.meetingLink,
        location: params.location,
      },
    },
    {
      enabled: Boolean(employer?.email && employer?.preferences?.notifications?.email !== false),
      payload: employer && {
        to: employer.email,
        recipientName: employer.name || params.employerName,
        role: 'employer' as const,
        counterpartName: params.candidateName,
        jobTitle: params.jobTitle,
        company: params.company,
        scheduledAt: params.scheduledAt,
        duration: params.duration,
        type: params.type,
        notes: params.notes,
        meetingLink: params.meetingLink,
        location: params.location,
      },
    },
  ];

  const verb = params.action === 'scheduled'
    ? 'scheduled'
    : params.action === 'cancelled'
      ? 'cancelled'
      : params.action === 'rescheduled'
        ? 'rescheduled'
        : 'updated';

  await Promise.all(
    recipients.map(async ({ enabled, payload }) => {
      if (!enabled || !payload) return;
      const intro = payload.role === 'candidate'
        ? `Your interview with ${params.company} has been ${verb}.`
        : `Your interview with ${params.candidateName} has been ${verb}.`;
      try {
        await sendInterviewEmail(
          payload,
          `Interview ${verb} - ${params.jobTitle}`,
          `Interview ${verb}`,
          intro,
        );
      } catch (error) {
        logger.error('Failed to send interview lifecycle email', {
          action: params.action,
          to: payload.to,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }),
  );
}

export async function sendInterviewReminderEmail(params: {
  userId: mongoose.Types.ObjectId | string;
  recipientName: string;
  counterpartName: string;
  jobTitle: string;
  company: string;
  scheduledAt: Date;
  duration: number;
  type: 'video' | 'phone' | 'in-person';
  notes?: string;
  meetingLink?: string;
  location?: string;
}) {
  if (!emailService.isConfigured()) {
    return false;
  }

  const user = await User.findById(params.userId).select('email preferences');
  if (!user?.email || user.preferences?.notifications?.email === false) {
    return true;
  }

  try {
    await sendInterviewEmail(
      {
        to: user.email,
        recipientName: params.recipientName,
        role: 'candidate',
        counterpartName: params.counterpartName,
        jobTitle: params.jobTitle,
        company: params.company,
        scheduledAt: params.scheduledAt,
        duration: params.duration,
        type: params.type,
        notes: params.notes,
        meetingLink: params.meetingLink,
        location: params.location,
      },
      `Interview reminder - ${params.jobTitle}`,
      'Interview reminder',
      `This is a reminder that your interview starts in about 10 minutes.`,
    );
    return true;
  } catch (error) {
    logger.error('Failed to send interview reminder email', {
      userId: String(params.userId),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
