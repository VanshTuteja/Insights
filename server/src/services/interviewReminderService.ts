import Interview from '../models/Interview';
import { createNotificationForUsers } from '../controllers/notificationController';
import { sendInterviewReminderEmail } from '../utils/interviewEmailService';
import logger from '../utils/logger';

let reminderInterval: NodeJS.Timeout | null = null;

async function processInterviewReminders() {
  const now = new Date();
  const from = new Date(now.getTime() + 9 * 60 * 1000);
  const to = new Date(now.getTime() + 10 * 60 * 1000 + 59 * 1000);

  const interviews = await Interview.find({
    status: { $in: ['scheduled', 'rescheduled'] },
    scheduledAt: { $gte: from, $lte: to },
    $or: [
      { candidateReminderSent: false },
      { employerReminderSent: false },
    ],
  })
    .populate('jobId', 'title company location')
    .populate('candidateId', 'name email preferences')
    .populate('interviewerId', 'name email preferences');

  for (const interview of interviews) {
    const candidate = interview.candidateId as any;
    const employer = interview.interviewerId as any;
    const job = interview.jobId as any;

    let updated = false;

    if (!interview.candidateReminderSent && candidate?._id) {
      const sent = await sendInterviewReminderEmail({
        userId: candidate._id,
        recipientName: candidate.name || 'Candidate',
        counterpartName: employer?.name || 'Employer',
        jobTitle: job?.title || 'Interview',
        company: job?.company || 'Company',
        scheduledAt: new Date(interview.scheduledAt),
        duration: interview.duration,
        type: interview.type,
        notes: interview.notes,
        meetingLink: interview.meetingLink,
        location: interview.location || job?.location,
      });
      if (sent) {
        interview.candidateReminderSent = true;
        updated = true;
        await createNotificationForUsers(
          [candidate._id],
          'interview-scheduled',
          'Interview reminder',
          `Your interview for ${job?.title || 'this role'} begins in about 10 minutes.`,
          job?._id,
        );
      }
    }

    if (!interview.employerReminderSent && employer?._id) {
      const sent = await sendInterviewReminderEmail({
        userId: employer._id,
        recipientName: employer.name || 'Employer',
        counterpartName: candidate?.name || 'Candidate',
        jobTitle: job?.title || 'Interview',
        company: job?.company || 'Company',
        scheduledAt: new Date(interview.scheduledAt),
        duration: interview.duration,
        type: interview.type,
        notes: interview.notes,
        meetingLink: interview.meetingLink,
        location: interview.location || job?.location,
      });
      if (sent) {
        interview.employerReminderSent = true;
        updated = true;
      }
    }

    if (updated) {
      await interview.save();
    }
  }
}

export function startInterviewReminderService() {
  if (reminderInterval) {
    return;
  }

  reminderInterval = setInterval(() => {
    processInterviewReminders().catch((error) => {
      logger.error('Interview reminder worker failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });
  }, 60 * 1000);

  processInterviewReminders().catch((error) => {
    logger.error('Initial interview reminder worker failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  });
}
