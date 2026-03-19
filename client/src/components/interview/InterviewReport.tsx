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
import { cn } from '@/lib/utils';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
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
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
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
          backgroundColor: darkTheme ? 'hsl(var(--primary) / 0.28)' : 'hsl(var(--primary) / 0.18)',
          borderColor: 'hsl(var(--primary))',
          borderWidth: 2,
          pointBackgroundColor: 'hsl(var(--primary))',
        },
      ],
    };
  }, [darkTheme, scores]);

  const chartOptions = useMemo(
    () => ({
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, color: 'hsl(var(--muted-foreground))', backdropColor: 'transparent' },
          angleLines: { color: darkTheme ? 'hsl(var(--border) / 0.45)' : 'hsl(var(--border) / 0.8)' },
          grid: { color: darkTheme ? 'hsl(var(--border) / 0.3)' : 'hsl(var(--border) / 0.65)' },
          pointLabels: { color: 'hsl(var(--foreground))' },
        },
      },
      plugins: {
        legend: { display: false },
      },
    }),
    [darkTheme]
  );

  const barItems = (Object.keys(SCORE_LABELS) as (keyof SessionScores)[]).map((key) => ({
    label: SCORE_LABELS[key],
    value: scores[key] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'rounded-3xl border px-6 py-7 shadow-lg',
          darkTheme
            ? 'border-primary/20 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--card)/0.88)_100%)] text-foreground'
            : 'border-primary/10 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted)/0.72)_100%)] text-foreground',
        )}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Interview Report</p>
            <h2 className="text-3xl font-semibold">Professional performance summary</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review your score profile, speaking quality, and body-language outcome for the {category} round.
            </p>
            <p className="text-xs text-muted-foreground">
              Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
              <p className="text-xs text-muted-foreground">Overall</p>
              <p className="mt-1 text-2xl font-semibold">{overallScore}</p>
            </div>
            <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="mt-1 text-2xl font-semibold">{confidenceScore}</p>
            </div>
            <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="mt-1 text-base font-semibold">{category}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
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

        <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
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
            <div className={cn('rounded-2xl border p-4 text-xs text-muted-foreground', darkTheme ? 'bg-background/55' : 'bg-slate-50')}>
              Relevance 25% | Communication 20% | Technical 20% | Confidence 15% | Structure 10% | Clarity 10%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
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
                  <li key={index} className={cn('rounded-xl border px-3 py-2', darkTheme ? 'bg-background/55' : 'bg-slate-50')}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Strength highlights will appear here after a scored response.</p>
            )}
          </CardContent>
        </Card>

        <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
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
                  <li key={index} className={cn('rounded-xl border px-3 py-2', darkTheme ? 'bg-background/55' : 'bg-slate-50')}>
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

      <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
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
