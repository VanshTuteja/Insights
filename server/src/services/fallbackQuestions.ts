import mongoose from 'mongoose';
import { InterviewCategory, DifficultyLevel } from '../models/Question';

const QUESTION_COUNT_DEFAULT = 5;

type DifficultyMap = Record<DifficultyLevel, string[]>;
type CategoryMap = Record<Exclude<InterviewCategory, 'Combined'>, DifficultyMap>;

const ALL_DIFFICULTIES: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
const BASE_CATEGORIES: Exclude<InterviewCategory, 'Combined'>[] = [
  'Technical',
  'Behavioral',
  'Leadership',
  'Problem Solving',
  'System Design',
  'HR',
];

// 20–30 base topics per category (spread across difficulties).
// These are short "concept" strings; we wrap them into natural
// questions using templates so users see varied phrasings.
const BASE_TOPICS: CategoryMap = {
  Technical: {
    beginner: [
      'REST APIs',
      'HTTP status codes',
      'Git and version control',
      'JavaScript promises',
      'asynchronous programming',
      'frontend vs backend',
      'HTML CSS and JavaScript roles',
      'client-server architecture',
      'basic database concepts',
      'SQL vs NoSQL databases',
      'CRUD operations',
      'authentication vs authorization',
      'JSON and its usage',
      'APIs in web applications',
      'environment variables',
      'package managers like npm or yarn',
      'Node.js runtime',
      'error handling in code',
      'logging and debugging basics',
      'browser devtools',
    ],
    intermediate: [
      'Express.js middleware',
      'MongoDB schema design',
      'indexing in databases',
      'database transactions and consistency',
      'caching strategies',
      'JWT-based authentication',
      'OAuth flows',
      'state management in React',
      'React hooks',
      'component reusability in React',
      'performance optimization in frontend apps',
      'API rate limiting',
      'pagination in APIs',
      'file uploads in web apps',
      'CI CD pipelines',
      'containerization with Docker',
      'testing strategies for web apps',
      'unit vs integration tests',
      'API versioning',
      'websockets vs HTTP',
    ],
    advanced: [
      'microservices architecture',
      'event-driven architectures',
      'message queues such as RabbitMQ or Kafka',
      'CQRS and event sourcing',
      'horizontal vs vertical scaling',
      'database sharding',
      'distributed transactions',
      'circuit breaker patterns',
      'API gateway patterns',
      'observability and tracing',
      'zero downtime deployments',
      'monolith to microservices migration',
      'multi-tenant architectures',
      'security best practices for REST APIs',
      'rate limiting and throttling at scale',
      'performance profiling in Node.js',
      'load testing strategies',
      'edge caching and CDNs',
      'data modeling for analytics',
      'consistency vs availability trade offs',
    ],
  },
  Behavioral: {
    beginner: [
      'working on a team project',
      'handling feedback from a mentor',
      'dealing with tight deadlines',
      'managing conflicting priorities',
      'asking for help when stuck',
      'adapting to a new tool or process',
      'taking ownership of a simple task',
      'communicating progress to a supervisor',
      'learning from a mistake at work or school',
      'staying motivated on repetitive tasks',
      'resolving a misunderstanding with a teammate',
      'sharing credit with others',
      'taking initiative without being asked',
      'keeping yourself organized',
      'balancing quality and speed',
      'receiving critical feedback',
      'working with a difficult teammate',
      'managing stress in a new role',
      'prioritizing tasks at the start of the day',
      'building trust with colleagues',
    ],
    intermediate: [
      'handling disagreements within a team',
      'leading a small project or feature',
      'mentoring or helping junior teammates',
      'managing expectations with stakeholders',
      'communicating delays or risks',
      'dealing with ambiguity in requirements',
      'influencing others without authority',
      'balancing multiple projects at once',
      'working with cross functional teams',
      'making trade offs under pressure',
      'recovering from a production incident',
      'giving constructive feedback to peers',
      'receiving feedback from peers',
      'maintaining work life balance',
      'adapting to organizational changes',
      'handling failure on an important task',
      'supporting a teammate under pressure',
      'navigating cultural differences at work',
      'staying calm in high pressure meetings',
      'owning the outcome of your work',
    ],
    advanced: [
      'driving cultural change in a team',
      'managing conflict between senior stakeholders',
      'navigating political dynamics in an organization',
      'championing diversity and inclusion',
      'making unpopular but necessary decisions',
      'handling ethical dilemmas at work',
      'building long term trust with partners',
      'coaching others through major change',
      'influencing organizational priorities',
      'handling persistent underperformance on a team',
      'leading through uncertainty',
      'aligning team behavior with company values',
      'managing burnout risk for yourself and others',
      'advocating for your team',
      'communicating difficult news transparently',
      'building psychological safety',
      'handling high stakes negotiations',
      'owning mistakes as a senior leader',
      'balancing short term wins with long term goals',
      'acting as a role model under scrutiny',
    ],
  },
  Leadership: {
    beginner: [
      'taking ownership of a small task',
      'supporting a teammate who is struggling',
      'volunteering to coordinate a simple project',
      'leading a meeting for the first time',
      'setting basic goals for yourself',
      'communicating expectations clearly',
      'delegating simple tasks',
      'motivating peers informally',
      'representing your team in a standup',
      'sharing knowledge with new teammates',
      'organizing collaboration sessions',
      'listening actively to team members',
      'mediating a minor disagreement',
      'encouraging quieter teammates to speak',
      'taking responsibility when things go wrong',
      'celebrating small wins',
      'managing your time as a leader',
      'seeking feedback on your leadership style',
      'balancing your own work with leadership tasks',
      'communicating decisions clearly',
    ],
    intermediate: [
      'setting direction for a small team',
      'creating alignment around a goal',
      'delegating complex tasks effectively',
      'developing teammates skills over time',
      'managing performance issues',
      'handling conflicts fairly',
      'motivating a team during setbacks',
      'prioritizing work for a team',
      'balancing technical work with people leadership',
      'influencing other teams',
      'hiring and onboarding new team members',
      'creating an inclusive team environment',
      'running effective one on ones',
      'giving growth oriented feedback',
      'representing your team to leadership',
      'managing stakeholder expectations',
      'handling changes in team direction',
      'dealing with limited resources',
      'advocating for your team needs',
      'planning team capacity',
    ],
    advanced: [
      'setting long term vision for a group',
      'aligning multiple teams around a roadmap',
      'building and evolving team culture',
      'scaling a team rapidly',
      'leading through reorganization',
      'making build vs buy decisions',
      'balancing innovation with stability',
      'mentoring other leaders',
      'creating succession plans',
      'managing senior stakeholder relationships',
      'defining metrics for team success',
      'navigating strategic trade offs',
      'owning cross functional programs',
      'handling underperforming leaders',
      'driving accountability across teams',
      'leading distributed or remote teams',
      'communicating strategy to the organization',
      'representing the company externally',
      'driving ethical decision making',
      'handling crises at organizational scale',
    ],
  },
  'Problem Solving': {
    beginner: [
      'breaking down a simple problem',
      'identifying root cause of a bug',
      'debugging an issue step by step',
      'asking clarifying questions',
      'documenting your thought process',
      'using logs to troubleshoot',
      'reproducing a reported issue',
      'testing simple hypotheses',
      'seeking help effectively',
      'choosing between two basic solutions',
      'evaluating the impact of a change',
      'avoiding premature optimization',
      'learning from past mistakes',
      'trying multiple approaches to a problem',
      'staying calm when stuck',
      'using online resources wisely',
      'time boxing exploration',
      'communicating trade offs clearly',
      'verifying that a fix actually works',
      'writing small experiments to test ideas',
    ],
    intermediate: [
      'analyzing ambiguous requirements',
      'designing experiments to validate assumptions',
      'prioritizing issues based on impact',
      'balancing short term fixes with long term solutions',
      'collaborating with others to solve complex issues',
      'identifying patterns across incidents',
      'preventing regressions after a fix',
      'structuring large problems into smaller pieces',
      'selecting appropriate algorithms or data structures',
      'optimizing slow code paths',
      'handling trade offs between performance and readability',
      'dealing with incomplete information',
      'challenging assumptions respectfully',
      'simplifying over engineered solutions',
      'proactively identifying potential risks',
      'debugging intermittent issues in production',
      'establishing a systematic debugging workflow',
      'evaluating third party tools as solutions',
      'navigating constraints like legacy systems',
      'learning new concepts quickly to solve a problem',
    ],
    advanced: [
      'solving cross team architectural problems',
      'designing long term technical strategies',
      'balancing business and technical trade offs',
      'resolving systemic reliability issues',
      'handling conflicting stakeholder priorities',
      'creating frameworks instead of one off fixes',
      'simplifying complex legacy architectures',
      'driving root cause analysis for major incidents',
      'anticipating future problems at scale',
      'navigating constraints like regulation or compliance',
      'optimizing large scale systems',
      'evaluating build vs buy for complex needs',
      'handling problems with no clear owner',
      'dealing with incomplete or noisy data',
      'creating decision making frameworks',
      ' communicating complex trade offs to non technical leaders',
      'leading cross functional problem solving workshops',
      'preventing classes of incidents across systems',
      'balancing innovation with operational risk',
      'turning crises into long term improvements',
    ],
  },
  'System Design': {
    beginner: [
      'designing a URL shortener',
      'designing a simple todo application',
      'designing a basic blogging platform',
      'designing a file upload service',
      'designing a notes taking app',
      'designing a basic chat application',
      'designing a weather dashboard',
      'designing a photo gallery app',
      'designing a simple notification system',
      'designing a task scheduler',
      'designing a library management system',
      'designing a quiz application',
      'designing a polling or voting app',
      'designing a product catalog page',
      'designing a contact form system',
      'designing an appointment booking app',
      'designing a user profile service',
      'designing a simple analytics dashboard',
      'designing a basic search feature',
      'designing an email subscription system',
    ],
    intermediate: [
      'designing an e commerce platform',
      'designing a scalable chat system',
      'designing a ride sharing service',
      'designing a food delivery platform',
      'designing a video streaming service',
      'designing a news feed like social media',
      'designing a logging and monitoring system',
      'designing a recommendation engine',
      'designing a notification service at scale',
      'designing an API rate limiting service',
      'designing a real time analytics system',
      'designing a feature flag service',
      'designing an authentication and authorization system',
      'designing a multi tenant SaaS platform',
      'designing a search service with autocomplete',
      'designing a fraud detection system',
      'designing a configuration management service',
      'designing a feature rollout system',
      'designing a document collaboration tool',
      'designing a job queue and worker system',
    ],
    advanced: [
      'designing a globally distributed system',
      'designing a multi region active active architecture',
      'designing a large scale microservices platform',
      'designing a data pipeline for big data',
      'designing a real time bidding system',
      'designing a highly available payment system',
      'designing a large scale cache infrastructure',
      'designing a workflow orchestration platform',
      'designing a system for GDPR compliance',
      'designing a multi cloud deployment strategy',
      'designing a self healing infrastructure',
      'designing a platform for experimentation and A B testing',
      'designing a global content delivery architecture',
      'designing a large scale search infrastructure',
      'designing an observability platform',
      'designing a feature marketplace ecosystem',
      'designing a hybrid on premise and cloud system',
      'designing a resilient messaging backbone',
      'designing a highly secure data storage system',
      'designing a low latency trading platform',
    ],
  },
  HR: {
    beginner: [
      'introducing yourself in an interview',
      'explaining your resume to a recruiter',
      'discussing your strengths',
      'discussing your weaknesses',
      'explaining why you want this role',
      'talking about your career goals',
      'answering questions about relocation',
      'discussing your preferred work environment',
      'talking about how you handle stress',
      'explaining a gap in your resume',
      'discussing your salary expectations',
      'explaining why you left a previous role',
      'describing your ideal manager',
      'talking about your learning style',
      'explaining how you work with others',
      'discussing your communication style',
      'talking about feedback you received',
      'explaining how you stay organized',
      'sharing what motivates you',
      'describing a proud achievement',
    ],
    intermediate: [
      'discussing long term career plans',
      'explaining how you evaluate job opportunities',
      'talking about your leadership aspirations',
      'discussing how you handle conflict with managers',
      'explaining how you handle changing priorities',
      'talking about remote or hybrid work preferences',
      'discussing how you contribute to culture',
      'explaining how you handle ethical concerns',
      'talking about diversity and inclusion',
      'discussing how you handle work life balance',
      'explaining how you choose between offers',
      'talking about expectations from your next role',
      'discussing how you stay up to date in your field',
      'explaining how you respond to failure',
      'talking about recognition and rewards',
      'discussing your ideal team culture',
      'explaining how you manage stress over time',
      'talking about situations where you disagreed with a decision',
      'discussing how you handle ambiguity',
      'explaining how you approach performance reviews',
    ],
    advanced: [
      'discussing your long term leadership vision',
      'explaining how you evaluate company culture',
      'talking about how you handle organizational politics',
      'discussing how you manage career transitions',
      'explaining how you mentor others',
      'talking about how you handle burnout',
      'discussing how you contribute beyond your role',
      'explaining how you make ethical career choices',
      'talking about your impact on previous organizations',
      'discussing how you handle difficult bosses',
      'explaining how you negotiate offers',
      'talking about international or cross cultural work',
      'discussing how you handle layoffs or restructuring',
      'explaining how you evaluate company stability',
      'talking about building your professional brand',
      'discussing your expectations from senior leadership',
      'explaining how you align your work with company goals',
      'talking about long term career risks you have taken',
      'discussing how you handle confidential information',
      'explaining how you decide to leave a company',
    ],
  },
};

const TEMPLATES: ((topic: string, category: InterviewCategory) => string)[] = [
  (topic) => `Explain ${topic} in simple terms.`,
  (topic) => `What is ${topic} and how does it work?`,
  (topic) => `How would you explain ${topic} to a junior developer?`,
  (topic) => `Can you describe ${topic} with a concrete example from your experience?`,
  (topic) => `Why is ${topic} important in modern software development?`,
  (topic) => `Walk me through how you would apply ${topic} in a real project.`,
  (topic) => `Describe a situation where you used ${topic} and what the outcome was.`,
  (topic) => `How do you decide when to use ${topic} versus an alternative approach?`,
  (topic) => `What are the main challenges when working with ${topic}, and how do you handle them?`,
  (topic) => `If you had to teach ${topic} to a new team member, how would you approach it?`,
];

const SYNONYM_GROUPS: string[][] = [
  ['explain', 'describe', 'outline'],
  ['important', 'critical', 'significant'],
  ['challenges', 'difficulties', 'obstacles'],
  ['outcome', 'result', 'impact'],
  ['approach', 'strategy', 'method'],
];

function applySynonymVariation(text: string): string {
  let result = text;
  for (const group of SYNONYM_GROUPS) {
    const [base, ...others] = group;
    if (result.toLowerCase().includes(base)) {
      const replacement = group[Math.floor(Math.random() * group.length)];
      const regex = new RegExp(base, 'i');
      result = result.replace(regex, replacement);
    }
  }
  return result;
}

function maybeShuffleClauses(text: string): string {
  // Simple clause shuffler based on "and".
  if (Math.random() < 0.5) return text;
  const parts = text.split(' and ');
  if (parts.length !== 2) return text;
  const first = parts[0].trim();
  const second = parts[1].trim();
  if (!first || !second) return text;
  const secondCap = second.charAt(0).toUpperCase() + second.slice(1);
  return `${secondCap} and ${first.toLowerCase()}`;
}

function generateQuestionText(topic: string, category: InterviewCategory): string {
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  let text = template(topic, category);
  text = applySynonymVariation(text);
  text = maybeShuffleClauses(text);
  return text;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getTopicsForCategory(category: Exclude<InterviewCategory, 'Combined'>, difficulty: DifficultyLevel): { topic: string; difficulty: DifficultyLevel }[] {
  const byDifficulty = BASE_TOPICS[category];
  if (!byDifficulty) return [];

  const primary = byDifficulty[difficulty] ?? [];
  const topics: { topic: string; difficulty: DifficultyLevel }[] = primary.map((t) => ({ topic: t, difficulty }));

  if (topics.length >= QUESTION_COUNT_DEFAULT) {
    return topics;
  }

  for (const diff of ALL_DIFFICULTIES) {
    if (diff === difficulty) continue;
    const extra = byDifficulty[diff] ?? [];
    for (const t of extra) {
      topics.push({ topic: t, difficulty: diff });
    }
  }

  return topics;
}

export interface GeneratedFallbackQuestion {
  _id: mongoose.Types.ObjectId;
  text: string;
  category: InterviewCategory;
  difficulty: DifficultyLevel;
}

export function generateFallbackQuestions(
  category: InterviewCategory,
  difficulty: DifficultyLevel = 'intermediate',
  count: number = QUESTION_COUNT_DEFAULT
): GeneratedFallbackQuestion[] {
  const results: GeneratedFallbackQuestion[] = [];
  const usedKeys = new Set<string>();

  const pickCategory = (): Exclude<InterviewCategory, 'Combined'> => {
    if (category === 'Combined') {
      return BASE_CATEGORIES[Math.floor(Math.random() * BASE_CATEGORIES.length)];
    }
    return category as Exclude<InterviewCategory, 'Combined'>;
  };

  for (let i = 0; i < count; i++) {
    const cat = pickCategory();
    const availableTopics = shuffle(getTopicsForCategory(cat, difficulty));
    const topicEntry = availableTopics.find((t) => !usedKeys.has(`${cat}:${t.topic}`));
    if (!topicEntry) {
      continue;
    }

    const key = `${cat}:${topicEntry.topic}`;
    usedKeys.add(key);

    const text = generateQuestionText(topicEntry.topic, cat);
    results.push({
      _id: new mongoose.Types.ObjectId(),
      text,
      category: cat,
      difficulty: topicEntry.difficulty,
    });
  }

  return results;
}

