import { useMemo } from 'react';
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Award, BarChart3, MessageSquareQuote, RotateCcw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { SessionScores } from '@/lib/interviewApi';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const SCORE_LABELS: Record<keyof SessionScores, string> = {
  relevance: 'Relevance',
  communication: 'Communication',
  technicalDepth: 'Technical Depth',
  confidence: 'Confidence',
  structure: 'Structure',
  clarity: 'Clarity',
};

interface InterviewReportProps {
  overallScore: number;
  confidenceScore: number;
  scores: Partial<SessionScores>;
  strengths: string[];
  improvements: string[];
  feedback: string;
  category: string;
  onRetake: () => void;
  onNewInterview: () => void;
}

export default function InterviewReport({
  overallScore,
  confidenceScore,
  scores,
  strengths,
  improvements,
  feedback,
  category,
  onRetake,
  onNewInterview,
}: InterviewReportProps) {
  const radarData = useMemo(() => {
    const normalized = {
      relevance: scores.relevance ?? 0,
      communication: scores.communication ?? 0,
      technicalDepth: scores.technicalDepth ?? 0,
      confidence: scores.confidence ?? 0,
      structure: scores.structure ?? 0,
      clarity: scores.clarity ?? 0,
    };

    return {
      labels: Object.keys(SCORE_LABELS).map((key) => SCORE_LABELS[key as keyof SessionScores]),
      datasets: [
        {
          label: 'Score',
          data: [
            normalized.relevance,
            normalized.communication,
            normalized.technicalDepth,
            normalized.confidence,
            normalized.structure,
            normalized.clarity,
          ],
          backgroundColor: 'rgba(14, 116, 144, 0.18)',
          borderColor: 'rgb(14, 116, 144)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(14, 116, 144)',
        },
      ],
    };
  }, [scores]);

  const chartOptions = useMemo(
    () => ({
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20 },
          angleLines: { color: 'rgba(148, 163, 184, 0.35)' },
          grid: { color: 'rgba(148, 163, 184, 0.25)' },
          pointLabels: { color: 'rgb(51, 65, 85)' },
        },
      },
      plugins: {
        legend: { display: false },
      },
    }),
    []
  );

  const barItems = (Object.keys(SCORE_LABELS) as (keyof SessionScores)[]).map((key) => ({
    label: SCORE_LABELS[key],
    value: scores[key] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-[linear-gradient(135deg,rgba(8,47,73,0.98),rgba(15,23,42,0.96))] px-6 py-7 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">Interview Report</p>
            <h2 className="text-3xl font-semibold">Professional performance summary</h2>
            <p className="max-w-2xl text-sm text-white/70">
              Review your score profile, speaking quality, and body-language outcome for the {category} round.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-white/60">Overall</p>
              <p className="mt-1 text-2xl font-semibold">{overallScore}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-white/60">Confidence</p>
              <p className="mt-1 text-2xl font-semibold">{confidenceScore}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-white/60">Category</p>
              <p className="mt-1 text-base font-semibold">{category}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Radar
            </CardTitle>
            <CardDescription>Score distribution across the interview dimensions.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-80 w-full max-w-md">
              <Radar data={radarData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Score highlights
            </CardTitle>
            <CardDescription>Weighted evaluation model used for this mock interview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {barItems.map(({ label, value }) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
            <div className="rounded-2xl border bg-slate-50 p-4 text-xs text-muted-foreground">
              Relevance 25% | Communication 20% | Technical 20% | Confidence 15% | Structure 10% | Clarity 10%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Strengths
            </CardTitle>
            <CardDescription>What worked well in this session.</CardDescription>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {strengths.map((item, index) => (
                  <li key={index} className="rounded-xl border bg-slate-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Strength highlights will appear here after a scored response.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Improvement focus
            </CardTitle>
            <CardDescription>Areas to tighten before your next round.</CardDescription>
          </CardHeader>
          <CardContent>
            {improvements.length > 0 ? (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {improvements.map((item, index) => (
                  <li key={index} className="rounded-xl border bg-slate-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Improvement notes will appear here after the AI evaluation runs.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5" />
            AI Feedback Summary
          </CardTitle>
          <CardDescription>A concise recap of how your answer was received.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">{feedback || 'Your interview summary will appear here once evaluation is complete.'}</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onRetake}>
          Retake same category
        </Button>
        <Button onClick={onNewInterview}>
          New interview
        </Button>
      </div>
    </div>
  );
}
