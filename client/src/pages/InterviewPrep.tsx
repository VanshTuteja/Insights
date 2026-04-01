import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import InterviewReport from '@/components/interview/InterviewReport';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { interviewApi, type AnswerEvaluation, type CompleteInterviewResponse, type InterviewHistoryItem, type InterviewQuestion, type InterviewState } from '@/lib/interviewApi';
import { useAuthStore } from '@/stores/authStore';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import {
  AlertCircle,
  Camera,
  Check,
  Loader2,
  Mic,
  MicOff,
  Play,
  Square,
  UserCircle2,
  VideoOff,
  WandSparkles,
} from 'lucide-react';

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: {
      transcript: string;
    };
  }>;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

const TOTAL_QUESTIONS = 5;
const DEFAULT_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'MERN Stack Developer',
  'React Developer',
  'Node.js Developer',
  'Software Engineer',
  'Other',
] as const;

function getStateLabel(state: InterviewState) {
  if (state === 'asking') return 'AI is asking';
  if (state === 'listening') return 'Listening';
  if (state === 'processing') return 'Processing';
  if (state === 'feedback') return 'Feedback ready';
  if (state === 'completed') return 'Completed';
  return 'Idle';
}

function getAverageConfidence(questions: InterviewQuestion[]) {
  const answered = questions.filter((item) => item.answer.trim());
  if (!answered.length) return 0;
  return Math.round(answered.reduce((sum, item) => sum + item.confidence, 0) / answered.length);
}

function normalizeQuestionText(question?: string) {
  if (!question) return '';
  return question
    .replace(/\*\*/g, '')
    .replace(/^here(?:'s| is).+?:/i, '')
    .replace(/^question\s*:?\s*/i, '')
    .replace(/\s*(evaluation criteria|follow-up prompts?)\s*:.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeQuestionItem(question: InterviewQuestion): InterviewQuestion {
  return {
    ...question,
    question: normalizeQuestionText(question.question),
  };
}

export default function InterviewPrep() {
  const { user } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);

  const [selectedRole, setSelectedRole] = useState<(typeof DEFAULT_ROLES)[number]>('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [transcript, setTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [report, setReport] = useState<CompleteInterviewResponse | null>(null);
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [questionVoiceMode, setQuestionVoiceMode] = useState<'cloud' | 'browser' | 'none'>('none');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const resolvedRole = selectedRole === 'Other' ? customRole.trim() : selectedRole;

  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.2), transparent 26%), radial-gradient(circle at top right, hsl(var(--accent) / 0.12), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.94) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.12), transparent 30%), radial-gradient(circle at top right, hsl(var(--accent) / 0.16), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.75) 52%, hsl(var(--background)) 100%)',
  };

  const cardClass = cn(
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95'
  );

  const setupMedia = useCallback(async () => {
    if (streamRef.current) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    setMediaReady(true);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => undefined);
    }
  }, []);

  const shutdownMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setMediaReady(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speakQuestion = useCallback(async (audioUrl?: string, questionText?: string) => {
    window.speechSynthesis?.cancel();

    if (!audioUrl && questionText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
      setQuestionVoiceMode('browser');
      return;
    }

    if (!audioUrl) {
      setQuestionVoiceMode('none');
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = audioUrl;
    try {
      await audioRef.current.play();
      setQuestionVoiceMode('cloud');
    } catch {
      setError('Question audio could not autoplay. Use the browser play controls or interact with the page first.');
      setQuestionVoiceMode('none');
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const items = await interviewApi.getHistory();
      setHistory(items);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
    return () => {
      shutdownMedia();
      recognitionRef.current?.stop();
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, [loadHistory, shutdownMedia]);

  const ensureRecognition = useCallback(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      throw new Error('Web Speech API is not supported in this browser.');
    }

    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const chunk = event.results[index][0]?.transcript || '';
        if (event.results[index].isFinal) {
          finalText += `${chunk} `;
        } else {
          interimText += chunk;
        }
      }

      if (finalText) {
        setTranscript((current) => `${current} ${finalText}`.trim());
      }
      setLiveTranscript(interimText.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error === 'not-allowed'
        ? 'Microphone permission is blocked. Please allow mic access and try again.'
        : 'Speech recognition stopped unexpectedly.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  const startInterview = useCallback(async () => {
    if (!resolvedRole) {
      setError('Choose a role first. If you selected Other, enter a custom profile name.');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setLastEvaluation(null);
    setTranscript('');
    setLiveTranscript('');

    try {
      await setupMedia();
      const data = await interviewApi.start(resolvedRole);
      const normalizedQuestion = normalizeQuestionItem(data.question);
      setSessionId(data.sessionId);
      setInterviewState(data.state);
      setQuestionIndex(data.currentQuestionIndex);
      setCurrentQuestion(normalizedQuestion);
      setQuestions([normalizedQuestion]);
      await speakQuestion(normalizedQuestion.audioUrl, normalizedQuestion.question);
    } catch (err: any) {
      setError(err.message || 'Failed to start the interview.');
    } finally {
      setLoading(false);
    }
  }, [resolvedRole, setupMedia, speakQuestion]);

  const startListening = useCallback(() => {
    try {
      const recognition = ensureRecognition();
      setTranscript('');
      setLiveTranscript('');
      setLastEvaluation(null);
      setInterviewState('listening');
      setError(null);
      recognition.start();
      setIsListening(true);
    } catch (err: any) {
      setError(err.message || 'Unable to start speech recognition.');
    }
  }, [ensureRecognition]);

  const submitAnswer = useCallback(async () => {
    if (!sessionId) return;
    const answerText = `${transcript} ${liveTranscript}`.trim();
    if (!answerText) {
      setError('No answer was transcribed. Please speak and try again.');
      return;
    }

    stopListening();
    setLoading(true);
    setInterviewState('processing');
    setError(null);

    try {
      const result = await interviewApi.answer(sessionId, answerText);
      setInterviewState(result.state);
      setLastEvaluation(result.evaluation);
      setQuestions((current) => current.map((item, index) => (
        index === result.questionIndex
          ? {
              ...item,
              answer: answerText,
              confidence: result.evaluation.confidence,
              feedback: result.evaluation.feedback,
              improvements: result.evaluation.improvements,
              scores: {
                clarity: result.evaluation.clarity,
                technical: result.evaluation.technical,
                communication: result.evaluation.communication,
              },
            }
          : item
      )));
    } catch (err: any) {
      setInterviewState('listening');
      setError(err.message || 'Failed to evaluate your answer.');
    } finally {
      setLoading(false);
    }
  }, [liveTranscript, sessionId, stopListening, transcript]);

  const moveNext = useCallback(async () => {
    if (!sessionId) return;

    if (questions.filter((item) => item.answer.trim()).length >= TOTAL_QUESTIONS) {
      setLoading(true);
      try {
        const result = await interviewApi.complete(sessionId);
        setReport({
          ...result,
          questions: result.questions.map(normalizeQuestionItem),
        });
        stopListening();
        audioRef.current?.pause();
        window.speechSynthesis?.cancel();
        shutdownMedia();
        setInterviewState('completed');
        await loadHistory();
      } catch (err: any) {
        setError(err.message || 'Failed to generate the final report.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const next = await interviewApi.next(sessionId);
      const normalizedQuestion = normalizeQuestionItem(next.question);
      setInterviewState(next.state);
      setQuestionIndex(next.currentQuestionIndex);
      setCurrentQuestion(normalizedQuestion);
      setQuestions((current) => [...current, normalizedQuestion]);
      setTranscript('');
      setLiveTranscript('');
      setLastEvaluation(null);
      await speakQuestion(normalizedQuestion.audioUrl, normalizedQuestion.question);
    } catch (err: any) {
      setError(err.message || 'Failed to load the next question.');
    } finally {
      setLoading(false);
    }
  }, [loadHistory, questions, sessionId, shutdownMedia, speakQuestion, stopListening]);

  const resetSession = useCallback(() => {
    stopListening();
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    shutdownMedia();
    setSessionId(null);
    setInterviewState('idle');
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setQuestions([]);
    setTranscript('');
    setLiveTranscript('');
    setLastEvaluation(null);
    setReport(null);
    setError(null);
    setQuestionVoiceMode('none');
  }, [shutdownMedia, stopListening]);

  const latestSession = history[0];
  const averageConfidence = getAverageConfidence(questions);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Sign in to practice</h2>
        <p className="max-w-md text-center text-muted-foreground">
          Log in to run AI-powered mock interviews with voice questions and live transcript feedback.
        </p>
        <Button asChild>
          <a href="/">Go to login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={pageShellStyle}>
      <AnimatedSection>
        <div
          className={cn(
            'rounded-3xl border px-6 py-8 shadow-xl',
            darkTheme
              ? 'border-primary/20 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--card)/0.86)_100%)] text-foreground'
              : 'border-primary/10 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted)/0.72)_100%)] text-foreground'
          )}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Interview Studio</p>
              <h1 className="text-3xl font-semibold">AI Mock Interview System</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Practice spoken interview rounds with verbal-only questions, live speech-to-text, AI voice playback, and a chart-based final report.
              </p>
              <p className="text-xs text-muted-foreground">
                Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
                <p className="text-xs text-muted-foreground">Interview state</p>
                <p className="mt-1 text-sm font-medium">{getStateLabel(interviewState)}</p>
              </div>
              <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
                <p className="text-xs text-muted-foreground">Questions answered</p>
                <p className="mt-1 text-sm font-medium">{questions.filter((item) => item.answer.trim()).length} / {TOTAL_QUESTIONS}</p>
              </div>
              <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
                <p className="text-xs text-muted-foreground">Confidence average</p>
                <p className="mt-1 text-sm font-medium">{averageConfidence}%</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : null}

      {report ? (
        <InterviewReport role={report.role} report={report.report} questions={report.questions} onRestart={resetSession} />
      ) : (
        <div className="grid gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
          <AnimatedSection delay={0.15}>
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WandSparkles className="h-5 w-5" />
                  Session setup
                </CardTitle>
                <CardDescription>Pick a default role or choose Other for a custom interview profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Target role</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {DEFAULT_ROLES.map((roleOption) => (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => setSelectedRole(roleOption)}
                        disabled={Boolean(sessionId)}
                        className={cn(
                          'flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all',
                          selectedRole === roleOption
                            ? 'border-primary bg-primary/10 text-foreground'
                            : darkTheme
                              ? 'border-border/60 bg-background/45 text-muted-foreground hover:border-primary/30'
                              : 'border-border bg-slate-50 text-muted-foreground hover:border-primary/30',
                          sessionId ? 'cursor-not-allowed opacity-70' : ''
                        )}
                      >
                        <span>{roleOption}</span>
                        {selectedRole === roleOption ? <Check className="h-4 w-4 text-primary" /> : null}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedRole === 'Other' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="custom-role">Custom profile name</label>
                    <Input
                      id="custom-role"
                      value={customRole}
                      onChange={(event) => setCustomRole(event.target.value)}
                      placeholder="e.g. QA Engineer or DevOps Engineer"
                      disabled={Boolean(sessionId)}
                    />
                  </div>
                ) : null}

                <div className={cn('rounded-2xl border p-4 text-sm', darkTheme ? 'border-border/60 bg-background/55' : 'border-border bg-slate-50')}>
                  <p className="font-medium text-foreground">How it works</p>
                  <p className="mt-2 text-muted-foreground">1. Start interview and allow camera + mic.</p>
                  <p className="text-muted-foreground">2. Get only spoken-answer friendly questions.</p>
                  <p className="text-muted-foreground">3. Answer verbally while speech recognition runs live.</p>
                  <p className="text-muted-foreground">4. Download a PDF report with charts after the round.</p>
                </div>

                <Button className="w-full" onClick={() => void startInterview()} disabled={loading || Boolean(sessionId)}>
                  {loading && !sessionId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  Start interview
                </Button>

                {latestSession ? (
                  <div className={cn('rounded-2xl border p-4 text-sm', darkTheme ? 'border-border/60 bg-background/55' : 'border-border bg-slate-50')}>
                    <p className="font-medium text-foreground">Latest report</p>
                    <p className="mt-2 text-muted-foreground">{latestSession.role}</p>
                    <p className="text-muted-foreground">Overall score: {latestSession.overallScore}</p>
                    <p className="text-muted-foreground">Confidence: {latestSession.report?.confidenceScore ?? 0}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </AnimatedSection>

          <div className="space-y-6">
            <Card className={cardClass}>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Current question</CardTitle>
                    <CardDescription>
                      {sessionId ? `Question ${questionIndex + 1} of ${TOTAL_QUESTIONS}` : 'Start an interview to load the first spoken-answer question.'}
                    </CardDescription>
                  </div>
                  <Badge variant={isListening ? 'destructive' : 'secondary'} className="w-fit">
                    {isListening ? 'Listening live' : getStateLabel(interviewState)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn('rounded-2xl border p-5 text-lg leading-relaxed', darkTheme ? 'border-primary/10 bg-background/50' : 'border-border bg-slate-50')}>
                  {currentQuestion?.question || 'Your AI interviewer question will appear here.'}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_360px]">
              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle>Live interview room</CardTitle>
                  <CardDescription>Camera on the left, AI interviewer on the right, transcript below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="relative overflow-hidden rounded-2xl border bg-slate-950">
                      <video ref={videoRef} autoPlay muted playsInline className="h-[260px] w-full object-cover sm:h-[320px]" />
                      {!mediaReady ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <VideoOff className="h-12 w-12 text-muted-foreground" />
                        </div>
                      ) : null}
                      <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                        <Camera className="mr-1 inline h-3.5 w-3.5" />
                        {mediaReady ? 'Camera live' : 'Camera offline'}
                      </div>
                    </div>

                    <div className={cn('relative overflow-hidden rounded-2xl border p-5', darkTheme ? 'border-primary/10 bg-background/50' : 'border-border bg-slate-50')}>
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <UserCircle2 className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">AI Interviewer</p>
                          <p className="text-sm text-muted-foreground">
                            {questionVoiceMode === 'cloud'
                              ? 'Google Cloud TTS voice with Groq-generated interview questions'
                              : questionVoiceMode === 'browser'
                                ? 'Browser voice fallback with Groq-generated interview questions'
                                : 'Groq-generated interview questions with voice fallback'}
                          </p>
                        </div>
                      </div>
                      <div className="mb-4 flex h-20 items-end gap-2">
                        {[20, 42, 60, 36, 70, 48, 58, 28, 62, 34].map((height, index) => (
                          <div
                            key={height + index}
                            className={cn('w-full rounded-full bg-primary/70 transition-all', interviewState === 'asking' ? 'animate-pulse' : 'opacity-50')}
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {questionVoiceMode === 'cloud'
                          ? 'Question audio is ready for this round.'
                          : questionVoiceMode === 'browser'
                            ? 'Question audio is being spoken using your browser voice.'
                            : 'Question audio is currently unavailable, but the text question is ready.'}
                      </p>
                    </div>
                  </div>

                  <div className={cn('rounded-2xl border p-4', darkTheme ? 'border-border/60 bg-background/55' : 'border-border bg-slate-50')}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Live transcript</p>
                      <span className={cn('text-xs', isListening ? 'text-red-500' : 'text-muted-foreground')}>
                        {isListening ? 'REC live' : 'Standby'}
                      </span>
                    </div>
                    <p className="mt-3 min-h-24 text-sm leading-6 text-muted-foreground">
                      {transcript || liveTranscript || 'Your spoken answer will appear here in real time.'}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <Button className="w-full" onClick={startListening} disabled={!sessionId || isListening || loading || interviewState === 'completed'}>
                      <Mic className="mr-2 h-4 w-4" />
                      Start answer
                    </Button>
                    <Button className="w-full" variant="outline" onClick={stopListening} disabled={!isListening}>
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop capture
                    </Button>
                    <Button className="w-full" onClick={() => void submitAnswer()} disabled={!sessionId || loading || (!transcript.trim() && !liveTranscript.trim())}>
                      {loading && interviewState === 'processing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Square className="mr-2 h-4 w-4" />}
                      Submit answer
                    </Button>
                    <Button className="w-full" variant="secondary" onClick={() => void moveNext()} disabled={!sessionId || loading || interviewState !== 'feedback'}>
                      {questions.filter((item) => item.answer.trim()).length >= TOTAL_QUESTIONS ? 'Finish interview' : 'Next'}
                    </Button>
                    <Button className="w-full" variant="ghost" onClick={resetSession} disabled={loading}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className={cardClass}>
                  <CardHeader>
                    <CardTitle>Confidence score</CardTitle>
                    <CardDescription>Updated after each evaluated answer.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-primary/20">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(hsl(var(--primary)) ${lastEvaluation?.confidence ?? averageConfidence}% , transparent 0)`,
                            mask: 'radial-gradient(circle at center, transparent 58%, black 59%)',
                            WebkitMask: 'radial-gradient(circle at center, transparent 58%, black 59%)',
                          }}
                        />
                        <div className="relative text-center">
                          <p className="text-3xl font-semibold text-foreground">{lastEvaluation?.confidence ?? averageConfidence}%</p>
                          <p className="text-xs text-muted-foreground">confidence</p>
                        </div>
                      </div>
                    </div>
                    <Progress value={lastEvaluation?.confidence ?? averageConfidence} className="h-2" />
                  </CardContent>
                </Card>

                <Card className={cardClass}>
                  <CardHeader>
                    <CardTitle>AI feedback</CardTitle>
                    <CardDescription>Clearer summary for the latest spoken answer.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    {lastEvaluation ? (
                      <>
                        <div className="space-y-3">
                          {[
                            { label: 'Clarity', value: lastEvaluation.clarity },
                            { label: 'Technical', value: lastEvaluation.technical },
                            { label: 'Communication', value: lastEvaluation.communication },
                          ].map((item) => (
                            <div key={item.label} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span>{item.label}</span>
                                <span className="font-medium text-foreground">{item.value}%</span>
                              </div>
                              <Progress value={item.value} className="h-2" />
                            </div>
                          ))}
                        </div>
                        <div className={cn('rounded-2xl border p-4', darkTheme ? 'border-border/60 bg-background/55' : 'border-border bg-slate-50')}>
                          <p className="leading-6">{lastEvaluation.feedback}</p>
                        </div>
                        {lastEvaluation.improvements.map((item, index) => (
                          <div key={`${item}-${index}`} className={cn('rounded-xl border px-3 py-2', darkTheme ? 'border-border/60 bg-background/55' : 'border-border bg-slate-50')}>
                            {item}
                          </div>
                        ))}
                      </>
                    ) : (
                      <p>Your confidence, clarity, technical score, and communication feedback will appear here after you submit an answer.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
