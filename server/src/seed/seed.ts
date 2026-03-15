/**
 * Seed script: creates Job Seeker, Employer, Jobs, Applications, and Interviews.
 * Run: npx ts-node -r tsconfig-paths/register src/seed/seed.ts
 * Or: npm run seed (if script is added)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/Users';
import Job from '../models/Job';
import Application from '../models/Application';
import Interview from '../models/Interview';
import { config } from '../config/index';

dotenv.config();

const SEED_PASSWORD = 'password123';
const JOBSEEKER = {
  name: 'Alex Jobseeker',
  email: 'alex@example.com',
  role: 'jobseeker' as const,
};

const EMPLOYER = {
  name: 'Recruiter Jane',
  email: 'jane@company.com',
  role: 'employer' as const,
};

async function seed() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Clear existing seed data (optional – comment out to keep existing)
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({ email: { $in: [JOBSEEKER.email, EMPLOYER.email] } });

    // Use plain password; User pre-save will hash it
    const jobseeker = await User.create({
      name: JOBSEEKER.name,
      email: JOBSEEKER.email,
      passwordHash: SEED_PASSWORD,
      role: JOBSEEKER.role,
      isVerified: true,
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      jobTitle: 'Frontend Developer',
    });

    const employer = await User.create({
      name: EMPLOYER.name,
      email: EMPLOYER.email,
      passwordHash: SEED_PASSWORD,
      role: EMPLOYER.role,
      isVerified: true,
      company: 'Tech Corp',
      jobTitle: 'HR Manager',
    });

    console.log('Created users:', jobseeker.email, employer.email);

    const job1 = await Job.create({
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      location: 'Remote',
      salary: '$120k - $150k',
      type: 'full-time',
      description: 'We are looking for a Senior Frontend Developer to build scalable web applications using React and TypeScript. You will work with a talented team and own the frontend architecture.',
      requirements: '5+ years React, TypeScript, REST APIs, testing',
      benefits: 'Health insurance, 401k, remote work, learning budget',
      tags: ['React', 'TypeScript', 'Frontend', 'Remote'],
      employerId: employer._id,
      views: 42,
      isActive: true,
    });

    const job2 = await Job.create({
      title: 'Full Stack Engineer',
      company: 'Tech Corp',
      location: 'New York, NY',
      salary: '$100k - $130k',
      type: 'hybrid',
      description: 'Full stack role working on our product platform. Backend in Node.js, frontend in React. Experience with MongoDB or PostgreSQL preferred.',
      requirements: '3+ years Node.js, React, SQL/NoSQL',
      benefits: 'Flexible hours, equity, team events',
      tags: ['Node.js', 'React', 'MongoDB', 'Full Stack'],
      employerId: employer._id,
      views: 28,
      isActive: true,
    });

    console.log('Created jobs:', job1.title, job2.title);

    const app1 = await Application.create({
      jobId: job1._id,
      candidateId: jobseeker._id,
      status: 'Under Review',
      resume: 'https://example.com/resume-alex.pdf',
      coverLetter: 'I am very interested in this role.',
    });

    const app2 = await Application.create({
      jobId: job2._id,
      candidateId: jobseeker._id,
      status: 'Applied',
      resume: 'https://example.com/resume-alex.pdf',
    });

    console.log('Created applications');

    const interviewDate = new Date();
    interviewDate.setDate(interviewDate.getDate() + 7);
    interviewDate.setHours(14, 0, 0, 0);

    await Interview.create({
      jobId: job1._id,
      candidateId: jobseeker._id,
      interviewerId: employer._id,
      employerId: employer._id,
      scheduledAt: interviewDate,
      duration: 60,
      type: 'video',
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/interview-1',
      notes: 'Please have your portfolio ready.',
    });

    console.log('Created interview');

    console.log('\n--- Seed complete ---');
    console.log('Job Seeker login:', JOBSEEKER.email, '/', SEED_PASSWORD);
    console.log('Employer login:', EMPLOYER.email, '/', SEED_PASSWORD);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
