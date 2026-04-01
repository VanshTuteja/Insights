import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Award, Download, Gauge, ListChecks, RotateCcw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import type { InterviewQuestion, InterviewReport as InterviewReportData, SessionScores } from '@/lib/interviewApi';

interface InterviewReportProps {
  role: string;
  report: InterviewReportData;
  questions: InterviewQuestion[];
  onRestart: () => void;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const safeHex = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  if (safeHex.length !== 6) {
    return `rgba(99, 102, 241, ${alpha})`;
  }

  const red = parseInt(safeHex.slice(0, 2), 16);
  const green = parseInt(safeHex.slice(2, 4), 16);
  const blue = parseInt(safeHex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function mixHex(hex: string, mixWith: string, ratio: number) {
  const normalize = (value: string) => {
    const cleaned = value.replace('#', '');
    return cleaned.length === 3
      ? cleaned.split('').map((char) => `${char}${char}`).join('')
      : cleaned;
  };

  const source = normalize(hex);
  const target = normalize(mixWith);

  if (source.length !== 6 || target.length !== 6) {
    return hex;
  }

  const blend = (from: number, to: number) => Math.round(from + (to - from) * ratio);

  const r = blend(parseInt(source.slice(0, 2), 16), parseInt(target.slice(0, 2), 16));
  const g = blend(parseInt(source.slice(2, 4), 16), parseInt(target.slice(2, 4), 16));
  const b = blend(parseInt(source.slice(4, 6), 16), parseInt(target.slice(4, 6), 16));

  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function ReportTooltip({
  active,
  payload,
  label,
  darkTheme,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  darkTheme: boolean;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className={cn(
      'rounded-xl border px-3 py-2 text-sm shadow-lg',
      darkTheme ? 'border-border/60 bg-card text-foreground' : 'border-border bg-white text-foreground'
    )}>
      <p className="mb-2 font-medium">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span style={{ color: item.color }}>{item.name}</span>
            <span>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function computeScoreSummary(questions: InterviewQuestion[]): SessionScores {
  const answered = questions.filter((item) => item.answer.trim());
  if (!answered.length) {
    return { confidence: 0, clarity: 0, technical: 0, communication: 0 };
  }

  const average = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

  return {
    confidence: average(answered.map((item) => item.confidence)),
    clarity: average(answered.map((item) => item.scores.clarity)),
    technical: average(answered.map((item) => item.scores.technical)),
    communication: average(answered.map((item) => item.scores.communication)),
  };
}

export default function InterviewReport({ role, report, questions, onRestart }: InterviewReportProps) {
  const theme = useThemeStore((state) => state.theme);
  const darkTheme = isDarkTheme(theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const scores = useMemo(() => computeScoreSummary(questions), [questions]);
  const chartPalette = useMemo(() => ({
    confidence: themePreview.primary,
    clarity: mixHex(themePreview.primary, darkTheme ? '#ffffff' : '#f59e0b', darkTheme ? 0.18 : 0.35),
    technical: mixHex(themePreview.primary, darkTheme ? '#38bdf8' : '#0f172a', darkTheme ? 0.35 : 0.42),
    communication: mixHex(themePreview.primary, darkTheme ? '#22c55e' : '#475569', darkTheme ? 0.28 : 0.55),
    radarFill: darkTheme ? hexToRgba(themePreview.primary, 0.34) : hexToRgba(themePreview.primary, 0.20),
    grid: darkTheme ? 'rgba(148,163,184,0.22)' : 'rgba(148,163,184,0.32)',
    axis: darkTheme ? 'rgba(241,245,249,0.92)' : 'rgba(15,23,42,0.85)',
  }), [darkTheme, themePreview]);

  const scoreCards = [
    { label: 'Confidence', shortLabel: 'Confidence', value: scores.confidence },
    { label: 'Clarity', shortLabel: 'Clarity', value: scores.clarity },
    { label: 'Technical', shortLabel: 'Technical', value: scores.technical },
    { label: 'Communication', shortLabel: 'Comm.', value: scores.communication },
  ];

  const perQuestionData = questions
    .filter((item) => item.answer.trim())
    .map((item, index) => ({
      name: `Q${index + 1}`,
      confidence: item.confidence,
      clarity: item.scores.clarity,
      technical: item.scores.technical,
      communication: item.scores.communication,
    }));

  const handleDownloadPdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(18);
    doc.text(`${role} Interview Report`, 14, 18);

    doc.setFontSize(12);
    doc.text(`Overall Score: ${report.overallScore}`, 14, 30);
    doc.text(`Confidence Score: ${report.confidenceScore}`, 110, 30);

    doc.setFontSize(13);
    doc.text('Score Chart', 14, 44);

    const chartLeft = 14;
    const chartTop = 60;
    const chartWidth = 182;
    const barHeight = 8;
    const barGap = 12;

    scoreCards.forEach((item, index) => {
      const y = chartTop + index * (barHeight + barGap);
      const fillColor =
        index === 0 ? chartPalette.confidence :
        index === 1 ? chartPalette.clarity :
        index === 2 ? chartPalette.technical :
        chartPalette.communication;

      doc.setTextColor(30, 41, 59);
      doc.text(item.label, chartLeft, y - 2);

      doc.setFillColor(230, 235, 241);
      doc.roundedRect(chartLeft + 40, y - 6, chartWidth - 65, barHeight, 2, 2, 'F');

      const rgb = fillColor.startsWith('#')
        ? [
            parseInt(fillColor.slice(1, 3), 16),
            parseInt(fillColor.slice(3, 5), 16),
            parseInt(fillColor.slice(5, 7), 16),
          ]
        : index === 0 ? [99, 102, 241] : index === 1 ? [245, 158, 11] : index === 2 ? [15, 23, 42] : [71, 85, 105];

      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.roundedRect(chartLeft + 40, y - 6, ((chartWidth - 65) * item.value) / 100, barHeight, 2, 2, 'F');
      doc.text(`${item.value}%`, chartLeft + chartWidth - 10, y - 2, { align: 'right' });
    });

    const summaryStartY = chartTop + scoreCards.length * (barHeight + barGap) + 10;
    const summaryLines = doc.splitTextToSize(`Summary: ${report.summary}`, 180);
    doc.text(summaryLines, 14, summaryStartY);

    let cursorY = summaryStartY + summaryLines.length * 6 + 8;

    const addSection = (title: string, items: string[]) => {
      doc.setFontSize(13);
      doc.text(title, 14, cursorY);
      cursorY += 7;
      doc.setFontSize(11);
      const safeItems = items.length ? items : ['No items available'];
      safeItems.forEach((item) => {
        const wrapped = doc.splitTextToSize(`- ${item}`, 176);
        doc.text(wrapped, 16, cursorY);
        cursorY += wrapped.length * 5 + 2;
      });
      cursorY += 4;
    };

    addSection('Strengths', report.strengths);
    addSection('Weaknesses', report.weaknesses);
    addSection('Improvements', report.improvements);

    doc.save(`${role.replace(/\s+/g, '-').toLowerCase()}-interview-report.pdf`);
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'rounded-3xl border px-6 py-7 shadow-lg',
          darkTheme
            ? 'border-primary/20 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--card)/0.88)_100%)] text-foreground'
            : 'border-primary/10 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted)/0.72)_100%)] text-foreground'
        )}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Final Report</p>
            <h2 className="text-3xl font-semibold">{role} mock interview summary</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">{report.summary}</p>
            <p className="text-xs text-muted-foreground">
              Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
              <p className="text-xs text-muted-foreground">Overall score</p>
              <p className="mt-1 text-2xl font-semibold">{report.overallScore}</p>
            </div>
            <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
              <p className="text-xs text-muted-foreground">Confidence score</p>
              <p className="mt-1 text-2xl font-semibold">{report.confidenceScore}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Score breakdown
            </CardTitle>
            <CardDescription>Theme-aware chart summary for your answered questions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={scoreCards} outerRadius="68%">
                  <PolarGrid stroke={chartPalette.grid} />
                  <PolarAngleAxis dataKey="shortLabel" tick={{ fill: chartPalette.axis, fontSize: 12 }} />
                  <Radar
                    dataKey="value"
                    stroke={chartPalette.confidence}
                    fill={chartPalette.radarFill}
                    fillOpacity={1}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {scoreCards.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Interview totals
            </CardTitle>
            <CardDescription>Quick snapshot of your session performance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className={cn('rounded-2xl border p-4', darkTheme ? 'bg-background/55' : 'bg-slate-50')}>
              <p className="text-xs uppercase tracking-wide">Questions answered</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{questions.filter((item) => item.answer.trim()).length}</p>
            </div>
            <div className={cn('rounded-2xl border p-4', darkTheme ? 'bg-background/55' : 'bg-slate-50')}>
              <p className="text-xs uppercase tracking-wide">Top focus</p>
              <p className="mt-2 text-foreground">{report.improvements[0] || 'Keep sharpening concise, example-led answers.'}</p>
            </div>
            <Button className="w-full" variant="outline" onClick={handleDownloadPdf}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Question-wise performance
          </CardTitle>
          <CardDescription>See how your confidence and answer quality changed across the round.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perQuestionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
              <XAxis dataKey="name" tick={{ fill: chartPalette.axis }} />
              <YAxis tick={{ fill: chartPalette.axis }} />
              <Tooltip content={<ReportTooltip darkTheme={darkTheme} />} />
              <Bar dataKey="confidence" name="Confidence" fill={chartPalette.confidence} radius={[6, 6, 0, 0]} />
              <Bar dataKey="clarity" name="Clarity" fill={chartPalette.clarity} radius={[6, 6, 0, 0]} />
              <Bar dataKey="technical" name="Technical" fill={chartPalette.technical} radius={[6, 6, 0, 0]} />
              <Bar dataKey="communication" name="Communication" fill={chartPalette.communication} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {report.strengths.length ? report.strengths.map((item, index) => (
              <div key={`${item}-${index}`} className={cn('rounded-xl border px-3 py-2', darkTheme ? 'bg-background/55' : 'bg-slate-50')}>
                {item}
              </div>
            )) : <p>No strengths were returned.</p>}
          </CardContent>
        </Card>

        <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {report.weaknesses.length ? report.weaknesses.map((item, index) => (
              <div key={`${item}-${index}`} className={cn('rounded-xl border px-3 py-2', darkTheme ? 'bg-background/55' : 'bg-slate-50')}>
                {item}
              </div>
            )) : <p>No weaknesses were returned.</p>}
          </CardContent>
        </Card>

        <Card className={cn('shadow-sm', darkTheme ? 'border-primary/15 bg-card/85' : 'border-slate-200')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {report.improvements.length ? report.improvements.map((item, index) => (
              <div key={`${item}-${index}`} className={cn('rounded-xl border px-3 py-2', darkTheme ? 'bg-background/55' : 'bg-slate-50')}>
                {item}
              </div>
            )) : <p>No improvement actions were returned.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onRestart}>Start another interview</Button>
      </div>
    </div>
  );
}
