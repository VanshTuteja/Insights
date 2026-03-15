import { EvaluationResult } from './groqService';
import { InterviewCategory } from '../models/Question';

type CategoryKey = InterviewCategory;

const FALLBACK_RESPONSES: Record<CategoryKey, EvaluationResult[]> = {
  Technical: [
    { score: 82, strengths: ['Clear explanation of concepts', 'Relevant technical example'], improvements: ['Add measurable achievements', 'Structure answer with STAR when possible'], feedback: 'Solid technical foundation. Consider adding more concrete examples from your experience.' },
    { score: 76, strengths: ['Good use of terminology', 'Logical flow'], improvements: ['Go deeper on trade-offs', 'Mention alternatives considered'], feedback: 'Relevant answer. To improve, discuss trade-offs and why you chose your approach.' },
    { score: 88, strengths: ['Concise and clear', 'Strong relevance to question', 'Good structure'], improvements: ['Slightly more detail on implementation'], feedback: 'Strong response. A bit more depth would make it excellent.' },
    { score: 71, strengths: ['Attempted to address the question'], improvements: ['Be more specific', 'Use a real project example', 'Improve clarity'], feedback: 'Answer was somewhat generic. Try to tie in a specific project or metric.' },
    { score: 79, strengths: ['Relevant keywords', 'Reasonable structure'], improvements: ['Stronger opening sentence', 'Quantify impact where possible'], feedback: 'Good effort. Opening with a one-line summary would strengthen the answer.' },
  ],
  Behavioral: [
    { score: 85, strengths: ['Clear situation described', 'Relevant example', 'Good reflection'], improvements: ['Add measurable outcomes', 'Tighten the closing'], feedback: 'Well-structured behavioral answer. Adding numbers or outcomes would strengthen it.' },
    { score: 78, strengths: ['Honest and authentic', 'Reasonable structure'], improvements: ['Use STAR format consistently', 'Prepare more specific examples'], feedback: 'Good authenticity. Using STAR (Situation, Task, Action, Result) will help structure.' },
    { score: 90, strengths: ['Specific example', 'Clear takeaway', 'Concise'], improvements: ['None major'], feedback: 'Strong behavioral response with clear situation and learning.' },
    { score: 72, strengths: ['Addressed the question'], improvements: ['Add a concrete example', 'Include what you learned', 'Keep under 2 minutes'], feedback: 'Consider adding one specific story with a clear result.' },
    { score: 81, strengths: ['Good self-awareness', 'Relevant strengths/weaknesses'], improvements: ['Tie weakness to improvement plan'], feedback: 'Solid. Always pair a weakness with how you are working on it.' },
  ],
  Leadership: [
    { score: 84, strengths: ['Leadership approach explained', 'Relevant scenario'], improvements: ['Add team outcome metric', 'Mention follow-up'], feedback: 'Good leadership example. Quantifying team impact would help.' },
    { score: 77, strengths: ['Clear decision process', 'Considered stakeholders'], improvements: ['Describe feedback received', 'Result of decision'], feedback: 'Decision-making was clear. Add the outcome and any feedback.' },
    { score: 86, strengths: ['Delegation example', 'Trust and accountability'], improvements: ['Mention how you followed up'], feedback: 'Strong delegation answer. Brief follow-up would complete the picture.' },
    { score: 73, strengths: ['Addressed conflict'], improvements: ['Use a specific example', 'State the resolution'], feedback: 'Try a specific conflict example with a clear resolution.' },
    { score: 80, strengths: ['Motivation approach', 'Empathy shown'], improvements: ['One concrete outcome'], feedback: 'Good people focus. One measurable outcome would strengthen the answer.' },
  ],
  'Problem Solving': [
    { score: 83, strengths: ['Structured approach', 'Logical steps'], improvements: ['Mention tools used', 'Time to resolve'], feedback: 'Clear problem-solving process. Adding tools and timeline would help.' },
    { score: 79, strengths: ['Breakdown of problem', 'Reasonable prioritization'], improvements: ['One concrete example', 'Result'], feedback: 'Good structure. A short real example would make it stronger.' },
    { score: 87, strengths: ['Data-driven', 'Clear criteria', 'Decision explained'], improvements: ['Brief risk mention'], feedback: 'Strong analytical answer. Briefly mention risks considered.' },
    { score: 75, strengths: ['Attempted structure'], improvements: ['Define the problem first', 'One specific example'], feedback: 'Start by stating the problem clearly, then your steps.' },
    { score: 81, strengths: ['Creative angle', 'Relevant to question'], improvements: ['Tie to business impact'], feedback: 'Good thinking. Connect the solution to business impact.' },
  ],
  'System Design': [
    { score: 80, strengths: ['High-level components', 'Reasonable scale discussion'], improvements: ['Data model sketch', 'Trade-offs'], feedback: 'Good overview. Add a simple data model and 1–2 trade-offs.' },
    { score: 85, strengths: ['Clear architecture', 'Scalability mentioned', 'Consistent terminology'], improvements: ['Failure handling'], feedback: 'Solid system design. Briefly cover failure scenarios.' },
    { score: 78, strengths: ['Components identified'], improvements: ['API contracts', 'Storage choice'], feedback: 'Add API design and storage choice to round out the answer.' },
    { score: 82, strengths: ['Structured answer', 'Load and scale considered'], improvements: ['Caching strategy'], feedback: 'Good structure. A caching layer would strengthen the design.' },
    { score: 76, strengths: ['Relevant components'], improvements: ['Order of operations', 'Bottlenecks'], feedback: 'Mention bottlenecks and the order you would build components.' },
  ],
  HR: [
    { score: 88, strengths: ['Professional tone', 'Clear and concise', 'Relevant to role'], improvements: ['One question back to interviewer'], feedback: 'Strong HR-style answer. Consider asking one clarifying question.' },
    { score: 82, strengths: ['Honest and positive', 'Good fit narrative'], improvements: ['Tie to company values'], feedback: 'Good. Weave in how you align with company values.' },
    { score: 79, strengths: ['Reasonable expectations', 'Flexible'], improvements: ['Research company benefits'], feedback: 'Solid. Showing you researched benefits would help.' },
    { score: 84, strengths: ['Clear timeline', 'Professional'], improvements: ['Mention what you are excited about'], feedback: 'Clear and professional. Add what excites you about the role.' },
    { score: 77, strengths: ['Addressed the question'], improvements: ['Be more specific', 'Align with job description'], feedback: 'Try to mirror language from the job description where relevant.' },
  ],
  Combined: [
    { score: 82, strengths: ['Clear explanation', 'Relevant example'], improvements: ['Add measurable achievements', 'Structure answer better'], feedback: 'Good overall response. Consider adding metrics and a clear structure.' },
    { score: 79, strengths: ['Addressed multiple aspects', 'Reasonable depth'], improvements: ['Stronger opening', 'One concrete example'], feedback: 'Covered the question. A single strong example would help.' },
    { score: 85, strengths: ['Balanced and professional', 'Good clarity'], improvements: ['Slightly more specificity'], feedback: 'Strong answer. One more specific detail would make it excellent.' },
    { score: 76, strengths: ['Relevant', 'Organized'], improvements: ['Technical depth', 'Concrete example'], feedback: 'Good structure. Add one technical or behavioral example.' },
    { score: 81, strengths: ['Good communication', 'Relevant content'], improvements: ['Tighten conclusion', 'One improvement area'], feedback: 'Clear communication. A concise summary at the end would help.' },
  ],
};

export function getFallbackEvaluation(category: CategoryKey): EvaluationResult {
  const list = FALLBACK_RESPONSES[category] || FALLBACK_RESPONSES.Combined;
  return list[Math.floor(Math.random() * list.length)];
}
