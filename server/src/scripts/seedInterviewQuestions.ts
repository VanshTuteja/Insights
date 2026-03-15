/**
 * Interview Prep - Questions seed (25-30 per category). Run: npx ts-node src/scripts/seedInterviewQuestions.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || '';

const questionSchema = new mongoose.Schema({
  category: String,
  text: String,
  difficulty: String,
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

const QUESTIONS: Array<{ category: string; text: string; difficulty: string }> = [
  // Technical (30)
  { category: 'Technical', text: 'Explain the difference between let, const, and var in JavaScript.', difficulty: 'beginner' },
  { category: 'Technical', text: 'How would you optimize a slow-performing database query?', difficulty: 'intermediate' },
  { category: 'Technical', text: 'Describe the concept of closures in programming.', difficulty: 'beginner' },
  { category: 'Technical', text: 'What is the time complexity of common sorting algorithms?', difficulty: 'intermediate' },
  { category: 'Technical', text: 'How would you implement a REST API with proper error handling?', difficulty: 'intermediate' },
  { category: 'Technical', text: 'Explain microservices architecture and when to use it.', difficulty: 'advanced' },
  { category: 'Technical', text: 'What are the SOLID principles? Give a brief example of each.', difficulty: 'intermediate' },
  { category: 'Technical', text: 'How does garbage collection work in JavaScript?', difficulty: 'intermediate' },
  { category: 'Technical', text: 'Describe the CAP theorem and its implications for distributed systems.', difficulty: 'advanced' },
  { category: 'Technical', text: 'How would you design a rate limiter for an API?', difficulty: 'intermediate' },
  { category: 'Technical', text: 'Explain the difference between SQL and NoSQL databases.', difficulty: 'beginner' },
  { category: 'Technical', text: 'What is dependency injection and why is it useful?', difficulty: 'intermediate' },
  { category: 'Technical', text: 'How do you approach debugging a production issue with no logs?', difficulty: 'advanced' },
  { category: 'Technical', text: 'Explain event-driven architecture.', difficulty: 'intermediate' },
  { category: 'Technical', text: 'What are WebSockets and when would you use them over HTTP?', difficulty: 'intermediate' },
  { category: 'Technical', text: 'Describe how you would implement authentication and authorization.', difficulty: 'intermediate' },
  { category: 'Technical', text: 'What is the difference between unit, integration, and e2e tests?', difficulty: 'beginner' },
  { category: 'Technical', text: 'How would you scale a web application to handle 1M concurrent users?', difficulty: 'advanced' },
  { category: 'Technical', text: 'Explain the React Virtual DOM and reconciliation.', difficulty: 'intermediate' },
  { category: 'Technical', text: 'What are design patterns you use most often?', difficulty: 'intermediate' },
  { category: 'Technical', text: 'How do you ensure code quality in a large codebase?', difficulty: 'advanced' },
  { category: 'Technical', text: 'Describe your experience with CI/CD pipelines.', difficulty: 'intermediate' },
  { category: 'Technical', text: 'What is the difference between horizontal and vertical scaling?', difficulty: 'beginner' },
  { category: 'Technical', text: 'How would you implement a cache invalidation strategy?', difficulty: 'advanced' },
  { category: 'Technical', text: 'Explain the concept of idempotency in APIs.', difficulty: 'intermediate' },
  { category: 'Technical', text: 'What are the trade-offs of using serverless architecture?', difficulty: 'advanced' },
  { category: 'Technical', text: 'How do you handle state management in a large frontend application?', difficulty: 'intermediate' },
  { category: 'Technical', text: 'Describe your approach to writing secure code.', difficulty: 'intermediate' },
  { category: 'Technical', text: 'What is the difference between synchronous and asynchronous programming?', difficulty: 'beginner' },
  { category: 'Technical', text: 'How would you design a real-time collaboration feature?', difficulty: 'advanced' },
  // Behavioral (28)
  { category: 'Behavioral', text: "Tell me about yourself and your background.", difficulty: 'beginner' },
  { category: 'Behavioral', text: "What are your greatest strengths and weaknesses?", difficulty: 'beginner' },
  { category: 'Behavioral', text: "How do you handle challenging situations at work?", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Describe a project you're particularly proud of.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Where do you see yourself in 5 years?", difficulty: 'beginner' },
  { category: 'Behavioral', text: "Tell me about a time you had to meet a tight deadline.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Describe a situation where you had to work with a difficult colleague.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "How do you prioritize when you have multiple urgent tasks?", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Tell me about a time you failed and what you learned.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Describe a time you received critical feedback. How did you respond?", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Give an example of when you went above and beyond for a project.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "How do you stay motivated when working on repetitive tasks?", difficulty: 'beginner' },
  { category: 'Behavioral', text: "Tell me about a time you had to learn something new quickly.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Describe a situation where you had to make a decision with incomplete information.", difficulty: 'advanced' },
  { category: 'Behavioral', text: "How do you handle disagreement with your manager?", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Tell me about a time you had to persuade someone to adopt your idea.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Describe your ideal work environment.", difficulty: 'beginner' },
  { category: 'Behavioral', text: "Why do you want to leave your current role?", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "What is your biggest achievement so far?", difficulty: 'beginner' },
  { category: 'Behavioral', text: "How do you handle stress and pressure?", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Tell me about a time you had to adapt to a major change.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "Describe a situation where you had to take initiative.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "What kind of feedback do you prefer?", difficulty: 'beginner' },
  { category: 'Behavioral', text: "Tell me about a time you had to say no to a request.", difficulty: 'advanced' },
  { category: 'Behavioral', text: "How do you balance work and personal life?", difficulty: 'beginner' },
  { category: 'Behavioral', text: "Describe a time you had to work with a remote team.", difficulty: 'intermediate' },
  { category: 'Behavioral', text: "What motivates you in your work?", difficulty: 'beginner' },
  { category: 'Behavioral', text: "Tell me about a time you had to deal with an underperforming team member.", difficulty: 'advanced' },
  // Leadership (27)
  { category: 'Leadership', text: "Describe a time when you had to lead a difficult project.", difficulty: 'intermediate' },
  { category: 'Leadership', text: "How do you motivate team members who are underperforming?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Tell me about a time you had to make an unpopular decision.", difficulty: 'advanced' },
  { category: 'Leadership', text: "How do you handle conflicts within your team?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "What's your approach to giving constructive feedback?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Describe how you delegate tasks effectively.", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Tell me about a time you had to manage a remote team.", difficulty: 'intermediate' },
  { category: 'Leadership', text: "How do you build trust with a new team?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Describe a situation where you had to advocate for your team.", difficulty: 'advanced' },
  { category: 'Leadership', text: "How do you handle a team member who disagrees with your direction?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Tell me about a time you had to turn around a struggling project.", difficulty: 'advanced' },
  { category: 'Leadership', text: "What is your leadership style?", difficulty: 'beginner' },
  { category: 'Leadership', text: "How do you set goals for your team?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Describe a time you had to mentor a junior team member.", difficulty: 'intermediate' },
  { category: 'Leadership', text: "How do you celebrate wins and handle failures as a leader?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Tell me about a time you had to make a decision without consensus.", difficulty: 'advanced' },
  { category: 'Leadership', text: "How do you prioritize your team's workload?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Describe a time you had to manage up to leadership.", difficulty: 'advanced' },
  { category: 'Leadership', text: "How do you foster innovation in your team?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Tell me about a time you had to let someone go.", difficulty: 'advanced' },
  { category: 'Leadership', text: "How do you handle a high-pressure deadline as a leader?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "What do you do when your team is demotivated?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "Describe how you run effective meetings.", difficulty: 'beginner' },
  { category: 'Leadership', text: "How do you balance being approachable with maintaining authority?", difficulty: 'advanced' },
  { category: 'Leadership', text: "Tell me about a time you had to implement an unpopular company policy.", difficulty: 'advanced' },
  { category: 'Leadership', text: "How do you develop leadership skills in others?", difficulty: 'intermediate' },
  { category: 'Leadership', text: "What is the hardest leadership lesson you've learned?", difficulty: 'intermediate' },
  // Problem Solving (28)
  { category: 'Problem Solving', text: "Walk me through how you would debug a production issue.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How would you approach a problem you've never encountered before?", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "Describe a time when you had to think outside the box.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How do you prioritize multiple urgent tasks?", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "Tell me about a time you failed and what you learned from it.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How would you reduce the load time of a slow web page?", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "Describe a time you had to make a quick decision with limited data.", difficulty: 'advanced' },
  { category: 'Problem Solving', text: "How do you break down a large, ambiguous problem?", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "Tell me about a time you had to convince others of your solution.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How would you handle a situation where two stakeholders want opposite things?", difficulty: 'advanced' },
  { category: 'Problem Solving', text: "Describe a time you used data to drive a decision.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How do you validate that your solution is correct?", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "Tell me about a time you had to simplify a complex process.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How would you approach a problem with no clear solution?", difficulty: 'advanced' },
  { category: 'Problem Solving', text: "Describe a time you had to pivot mid-project.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How do you balance perfectionism with shipping on time?", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "Tell me about a time you identified a problem before it became critical.", difficulty: 'advanced' },
  { category: 'Problem Solving', text: "How would you design an experiment to test a hypothesis?", difficulty: 'advanced' },
  { category: 'Problem Solving', text: "Describe a time you had to learn from a failed approach.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How do you handle conflicting requirements from different teams?", difficulty: 'advanced' },
  { category: 'Problem Solving', text: "Tell me about a time you improved an existing system.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How would you approach a problem that has multiple valid solutions?", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "Describe a time you had to work with incomplete or wrong requirements.", difficulty: 'advanced' },
  { category: 'Problem Solving', text: "How do you stay focused when solving a long-running problem?", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "Tell me about a time you had to choose between speed and quality.", difficulty: 'intermediate' },
  { category: 'Problem Solving', text: "How would you troubleshoot a bug that only happens in production?", difficulty: 'advanced' },
  { category: 'Problem Solving', text: "Describe a time you had to reverse a decision.", difficulty: 'advanced' },
  { category: 'Problem Solving', text: "How do you document your problem-solving process?", difficulty: 'beginner' },
  // System Design (26)
  { category: 'System Design', text: "Design a URL shortener like bit.ly.", difficulty: 'intermediate' },
  { category: 'System Design', text: "How would you design a news feed like Twitter or Facebook?", difficulty: 'advanced' },
  { category: 'System Design', text: "Design a rate limiter for an API.", difficulty: 'intermediate' },
  { category: 'System Design', text: "How would you design a real-time chat application?", difficulty: 'intermediate' },
  { category: 'System Design', text: "Design a distributed cache system.", difficulty: 'advanced' },
  { category: 'System Design', text: "How would you design a video streaming platform like Netflix?", difficulty: 'advanced' },
  { category: 'System Design', text: "Design a search autocomplete system.", difficulty: 'intermediate' },
  { category: 'System Design', text: "How would you design a ride-sharing matching system?", difficulty: 'advanced' },
  { category: 'System Design', text: "Design a key-value store.", difficulty: 'intermediate' },
  { category: 'System Design', text: "How would you design a notification system?", difficulty: 'intermediate' },
  { category: 'System Design', text: "Design a system that handles millions of events per second.", difficulty: 'advanced' },
  { category: 'System Design', text: "How would you design a file storage and sync service like Dropbox?", difficulty: 'advanced' },
  { category: 'System Design', text: "Design a leaderboard for a game.", difficulty: 'intermediate' },
  { category: 'System Design', text: "How would you design a recommendation system?", difficulty: 'advanced' },
  { category: 'System Design', text: "Design a distributed job queue.", difficulty: 'intermediate' },
  { category: 'System Design', text: "How would you design an analytics pipeline?", difficulty: 'advanced' },
  { category: 'System Design', text: "Design a system for handling payment transactions.", difficulty: 'advanced' },
  { category: 'System Design', text: "How would you design a collaborative document editor?", difficulty: 'advanced' },
  { category: 'System Design', text: "Design a CDN for static assets.", difficulty: 'intermediate' },
  { category: 'System Design', text: "How would you design a system to detect fraud?", difficulty: 'advanced' },
  { category: 'System Design', text: "Design a metrics and monitoring system.", difficulty: 'intermediate' },
  { category: 'System Design', text: "How would you design a URL crawler?", difficulty: 'intermediate' },
  { category: 'System Design', text: "Design a system for real-time collaboration.", difficulty: 'advanced' },
  { category: 'System Design', text: "How would you design a system that is both consistent and highly available?", difficulty: 'advanced' },
  { category: 'System Design', text: "Design a mobile backend that works offline.", difficulty: 'intermediate' },
  { category: 'System Design', text: "How would you design an API gateway?", difficulty: 'intermediate' },
  // HR (26)
  { category: 'HR', text: "What are your salary expectations?", difficulty: 'intermediate' },
  { category: 'HR', text: "When can you start?", difficulty: 'beginner' },
  { category: 'HR', text: "Why do you want to work here?", difficulty: 'beginner' },
  { category: 'HR', text: "What do you know about our company?", difficulty: 'beginner' },
  { category: 'HR', text: "Do you have any questions for us?", difficulty: 'beginner' },
  { category: 'HR', text: "What is your preferred work arrangement: remote, hybrid, or on-site?", difficulty: 'beginner' },
  { category: 'HR', text: "How do you handle multiple deadlines?", difficulty: 'intermediate' },
  { category: 'HR', text: "What benefits are most important to you?", difficulty: 'beginner' },
  { category: 'HR', text: "Have you ever been fired or asked to resign?", difficulty: 'advanced' },
  { category: 'HR', text: "Why are you leaving your current job?", difficulty: 'intermediate' },
  { category: 'HR', text: "What would your current manager say about you?", difficulty: 'intermediate' },
  { category: 'HR', text: "Describe your ideal manager.", difficulty: 'beginner' },
  { category: 'HR', text: "What kind of team do you work best with?", difficulty: 'intermediate' },
  { category: 'HR', text: "How do you handle criticism?", difficulty: 'intermediate' },
  { category: 'HR', text: "What are you looking for in your next role?", difficulty: 'intermediate' },
  { category: 'HR', text: "Tell me about a gap in your resume.", difficulty: 'advanced' },
  { category: 'HR', text: "Are you interviewing with other companies?", difficulty: 'intermediate' },
  { category: 'HR', text: "What is your notice period?", difficulty: 'beginner' },
  { category: 'HR', text: "How do you prefer to receive feedback?", difficulty: 'beginner' },
  { category: 'HR', text: "What would you do in your first 90 days here?", difficulty: 'intermediate' },
  { category: 'HR', text: "What motivates you to do your best work?", difficulty: 'beginner' },
  { category: 'HR', text: "Describe your work style.", difficulty: 'beginner' },
  { category: 'HR', text: "What is your greatest professional achievement?", difficulty: 'intermediate' },
  { category: 'HR', text: "How do you stay updated in your field?", difficulty: 'intermediate' },
  { category: 'HR', text: "What are your long-term career goals?", difficulty: 'beginner' },
  { category: 'HR', text: "Is there anything else we should know about you?", difficulty: 'beginner' },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  const existing = await Question.countDocuments();
  if (existing > 0) {
    console.log(`Found ${existing} questions. Clear collection first to re-seed, or skip.`);
    await mongoose.disconnect();
    process.exit(0);
    return;
  }
  await Question.insertMany(QUESTIONS);
  console.log(`Inserted ${QUESTIONS.length} questions.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
