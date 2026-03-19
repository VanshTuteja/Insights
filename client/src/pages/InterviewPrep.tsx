import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import InterviewReport from '@/components/interview/InterviewReport';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { useFaceMetrics } from '@/hooks/useFaceMetrics';
import { interviewApi, type DifficultyLevel, type Evaluation, type InterviewCategory, type QuestionItem } from '@/lib/interviewApi';
import { getThemePreview, isDarkTheme, useThemeStore } from '@/stores/themeStore';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  History,
  Loader2,
  Mic,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Target,
  VideoOff,
} from 'lucide-react';

const CATEGORIES: { name: InterviewCategory; label: string }[] = [
  { name: 'Technical', label: 'Technical' },
  { name: 'Behavioral', label: 'Behavioral' },
  { name: 'Leadership', label: 'Leadership' },
  { name: 'Problem Solving', label: 'Problem Solving' },
  { name: 'System Design', label: 'System Design' },
  { name: 'HR', label: 'HR' },
  { name: 'Combined', label: 'Combined (Random)' },
];

const DIFFICULTIES: { value: DifficultyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const QUESTION_TIME_LIMIT = 90;
const RECORDER_MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
];

function pickSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  return RECORDER_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function hasUsableTracks(stream: MediaStream | null) {
  return Boolean(stream && stream.getTracks().some((track) => track.readyState === 'live' && track.enabled));
}

export default function InterviewPrep() {
  const { user } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const themePreview = useMemo(() => getThemePreview(theme), [theme]);
  const darkTheme = isDarkTheme(theme);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [category, setCategory] = useState<InterviewCategory | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_TIME_LIMIT);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingMode, setRecordingMode] = useState<'video' | 'audio'>('video');
  const [permissionState, setPermissionState] = useState<'idle' | 'granted' | 'fallback-audio' | 'denied'>('idle');
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [nextQuestionIndex, setNextQuestionIndex] = useState<number | null>(null);
  const [evaluationMeta, setEvaluationMeta] = useState<{ usedFallbackEvaluation: boolean; transcriptDetected: boolean } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const { liveMetrics, getFinalMetrics, loading: faceLoading, sampleCount } = useFaceMetrics({
    videoRef,
    isActive: isRecording && recordingMode === 'video',
  });

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;
  const latestSession = history[0] ?? null;
  const pageShellStyle = {
    backgroundImage: darkTheme
      ? 'radial-gradient(circle at top left, hsl(var(--primary) / 0.2), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.14), transparent 24%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.95) 100%)'
      : 'radial-gradient(circle at top left, hsl(var(--primary) / 0.1), transparent 28%), radial-gradient(circle at top right, hsl(var(--accent) / 0.16), transparent 22%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.74) 52%, hsl(var(--background)) 100%)',
  };
  const sectionCardClass = cn(
    'border shadow-premium-lg backdrop-blur',
    darkTheme ? 'border-primary/15 bg-card/80' : 'border-border/80 bg-card/95',
  );
  const mutedPanelClass = cn(
    'rounded-2xl border p-4',
    darkTheme ? 'border-border/60 bg-background/50' : 'border-border bg-slate-50',
  );

  useEffect(() => {
    if (!isRecording || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining((remaining) => remaining - 1), 1000);
    return () => clearInterval(timer);
  }, [isRecording, timeRemaining]);

  useEffect(() => {
    if (isRecording && timeRemaining === 0) stopRecording();
  }, [isRecording, timeRemaining]);

  const requestMedia = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermissionState('granted');
      setRecordingMode('video');
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play().catch(() => {});
      }
      return stream;
    } catch (videoError) {
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setPermissionState('fallback-audio');
        setRecordingMode('audio');
        setMediaStream(audioOnlyStream);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setError('Camera unavailable. Audio-only practice is enabled.');
        return audioOnlyStream;
      } catch (audioError) {
        setPermissionState('denied');
        setError('Camera/microphone permissions are blocked. Please allow access and try again.');
        throw audioError ?? videoError;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
    };
  }, [mediaStream]);

  const startRecording = useCallback(async () => {
    try {
      let stream = mediaStream;
      if (!hasUsableTracks(stream)) stream = await requestMedia();
      if (typeof MediaRecorder === 'undefined') throw new Error('This browser does not support recording.');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      const mimeType = pickSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream!, { mimeType }) : new MediaRecorder(stream!);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        mediaRecorderRef.current = null;
        const blobType = mimeType || recordedChunksRef.current[0]?.type || 'audio/webm';
        if (recordedChunksRef.current.length === 0) {
          setRecordedBlob(null);
          setError('No recording was captured. Please try again.');
          return;
        }
        setRecordedBlob(new Blob(recordedChunksRef.current, { type: blobType }));
      };
      recorder.onerror = () => {
        mediaRecorderRef.current = null;
        setIsRecording(false);
        setError('Recording failed. Please allow microphone access and try again.');
      };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setRecordedBlob(null);
      setLastEvaluation(null);
      setLastTranscript(null);
      setShowEvaluation(false);
      setEvaluationMeta(null);
      setNextQuestionIndex(null);
      setTimeRemaining(QUESTION_TIME_LIMIT);
      setIsRecording(true);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to start recording.');
    }
  }, [mediaStream, requestMedia]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (typeof mediaRecorderRef.current.requestData === 'function') {
        mediaRecorderRef.current.requestData();
      }
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const submitResponse = useCallback(async () => {
    if (!sessionId || !recordedBlob) {
      setError('No recording to submit. Record your answer first.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const confidenceMetrics = getFinalMetrics() ?? undefined;
      const data = await interviewApi.uploadResponse(sessionId, currentIndex, recordedBlob, confidenceMetrics);
      setLastTranscript(data.transcript);
      setLastEvaluation(data.evaluation);
      setEvaluationMeta({
        usedFallbackEvaluation: Boolean(data.usedFallbackEvaluation),
        transcriptDetected: Boolean(data.transcriptDetected),
      });
      setShowEvaluation(true);
      setRecordedBlob(null);
      recordedChunksRef.current = [];
      setNextQuestionIndex(data.nextQuestionIndex);

      if (data.isComplete) {
        const finalResult = await interviewApi.getResult(sessionId);
        setResult(finalResult);
        setSessionComplete(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [currentIndex, getFinalMetrics, recordedBlob, sessionId]);

  const nextQuestion = useCallback(() => {
    setShowEvaluation(false);
    setLastEvaluation(null);
    setLastTranscript(null);
    setEvaluationMeta(null);
    setRecordedBlob(null);
    recordedChunksRef.current = [];
    setCurrentIndex((index) => (nextQuestionIndex != null ? nextQuestionIndex : index + 1));
    setNextQuestionIndex(null);
    setTimeRemaining(QUESTION_TIME_LIMIT);
  }, [nextQuestionIndex]);

  const startInterview = useCallback(async (selectedCategory: InterviewCategory) => {
    setError(null);
    setLoadingQuestions(true);
    setCategory(selectedCategory);
    try {
      const data = await interviewApi.start(selectedCategory, difficulty);
      const allQuestions: QuestionItem[] = [data.question];
      for (let index = 1; index < data.totalQuestions; index += 1) {
        const next = await interviewApi.getQuestion(data.sessionId, index);
        allQuestions.push(next.question);
      }
      setSessionId(data.sessionId);
      setQuestions(allQuestions);
      setCurrentIndex(0);
      setSessionComplete(false);
      setResult(null);
      setTimeRemaining(QUESTION_TIME_LIMIT);
      setLastEvaluation(null);
      setLastTranscript(null);
      setShowEvaluation(false);
      setRecordedBlob(null);
      setNextQuestionIndex(null);
      setEvaluationMeta(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to start interview');
    } finally {
      setLoadingQuestions(false);
    }
  }, [difficulty]);

  const reset = useCallback(() => {
    setSessionId(null);
    setCategory(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSessionComplete(false);
    setResult(null);
    setLastEvaluation(null);
    setLastTranscript(null);
    setShowEvaluation(false);
    setRecordedBlob(null);
    setNextQuestionIndex(null);
    setEvaluationMeta(null);
    setError(null);
    setIsRecording(false);
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    mediaStream?.getTracks().forEach((track) => track.stop());
    setMediaStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setPermissionState('idle');
    setRecordingMode('video');
    setTimeRemaining(QUESTION_TIME_LIMIT);
  }, [mediaStream]);

  const handleRetake = useCallback(() => {
    reset();
    if (category) void startInterview(category);
  }, [category, reset, startInterview]);

  useEffect(() => {
    if (user) interviewApi.getHistory().then(setHistory).catch(() => {});
  }, [sessionComplete, user]);

  const performanceStatus = useMemo(() => {
    if (recordingMode === 'audio') {
      return {
        confidence: 'Audio-only mode is active, so visual scores are paused for this answer.',
        eyeContact: 'Enable the camera if you want live eye-contact guidance.',
        engagement: 'Your answer will still be reviewed based on spoken content and delivery.',
      };
    }
    if (!liveMetrics || sampleCount === 0) {
      return {
        confidence: 'Live confidence starts once the camera captures a stable face sample.',
        eyeContact: 'Stay centered and look close to the camera lens for a more accurate eye-contact score.',
        engagement: 'Keep speaking naturally while the panel builds a live reading.',
      };
    }
    return {
      confidence:
        (liveMetrics.confidenceScore ?? 0) >= 75 ? 'Confident delivery detected.' : (liveMetrics.confidenceScore ?? 0) >= 45 ? 'Steady delivery, with room to sound sharper.' : 'Confidence looks low right now. Slow down and make the opening clearer.',
      eyeContact:
        (liveMetrics.eyeContact ?? 0) >= 75 ? 'Strong eye contact with the camera.' : (liveMetrics.eyeContact ?? 0) >= 45 ? 'Eye contact is moderate. Bring your gaze closer to the lens.' : 'You are looking away often. Try to keep the lens near your natural eye line.',
      engagement:
        (liveMetrics.engagementLevel ?? 0) >= 70 ? 'Engagement looks strong.' : (liveMetrics.engagementLevel ?? 0) >= 45 ? 'Engagement is moderate. Add a little more energy.' : 'Engagement looks low. Vary tone and keep your answer more purposeful.',
    };
  }, [liveMetrics, recordingMode, sampleCount]);

  const scoreCards = liveMetrics && sampleCount > 0
    ? [
        { label: 'Confidence', value: liveMetrics.confidenceScore ?? 0 },
        { label: 'Eye Contact', value: liveMetrics.eyeContact ?? 0 },
        { label: 'Engagement', value: liveMetrics.engagementLevel ?? 0 },
      ]
    : [];

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Sign in to practice</h2>
        <p className="max-w-md text-center text-muted-foreground">
          Log in to start AI-powered mock interviews and save your progress.
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
              : 'border-primary/10 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted)/0.72)_100%)] text-foreground',
          )}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Interview Studio</p>
              <h1 className="text-3xl font-semibold">AI Interview Preparation</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Practice realistic interviews with a more reliable recorder, audio fallback, live coaching, and face metrics that only score when they truly detect you.
              </p>
              <p className="text-xs text-muted-foreground">
                Theme: <span className="font-medium text-foreground">{themePreview.label}</span>
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
                <p className="text-xs text-muted-foreground">Recorder</p>
                <p className="mt-1 text-sm font-medium">{recordingMode === 'video' ? 'Video + audio' : 'Audio only'}</p>
              </div>
              <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
                <p className="text-xs text-muted-foreground">Face tracking</p>
                <p className="mt-1 text-sm font-medium">{sampleCount > 0 ? `${sampleCount} samples` : 'Not locked'}</p>
              </div>
              <div className={cn('rounded-2xl px-4 py-3', darkTheme ? 'bg-background/45' : 'bg-background/80')}>
                <p className="text-xs text-muted-foreground">Time per answer</p>
                <p className="mt-1 text-sm font-medium">{QUESTION_TIME_LIMIT} seconds</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {loadingQuestions && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 p-4 text-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm">Preparing interview questions...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <AnimatedSection delay={0.15}>
          <Card className={sectionCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Interview setup
              </CardTitle>
              <CardDescription>Choose your track, difficulty, and device permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={mutedPanelClass}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Permissions</span>
                  <Badge variant={permissionState === 'granted' ? 'default' : permissionState === 'fallback-audio' ? 'secondary' : 'outline'}>
                    {permissionState === 'granted'
                      ? 'Camera + mic ready'
                      : permissionState === 'fallback-audio'
                        ? 'Audio-only'
                        : permissionState === 'denied'
                          ? 'Blocked'
                          : 'Not enabled'}
                  </Badge>
                </div>
                <Button variant="outline" className="w-full" onClick={requestMedia}>
                  <Mic className="mr-2 h-4 w-4" />
                  {permissionState === 'idle' ? 'Enable camera & mic' : 'Refresh permissions'}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  If the camera is unavailable, practice continues with audio-only recording instead of failing.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((item) => (
                    <Button
                      key={item.value}
                      size="sm"
                      variant={difficulty === item.value ? 'default' : 'outline'}
                      onClick={() => setDifficulty(item.value)}
                      disabled={!!sessionId && !sessionComplete}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {CATEGORIES.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: sessionId && !sessionComplete ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      category === item.name ? 'border-primary bg-primary/8' : darkTheme ? 'hover:border-primary/30 hover:bg-background/45' : 'hover:border-primary/40'
                    } ${sessionId && !sessionComplete ? 'cursor-not-allowed opacity-70' : ''}`}
                    onClick={() => {
                      if (!sessionId && !loadingQuestions) void startInterview(item.name);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      {category === item.name ? <Badge variant="secondary">Selected</Badge> : null}
                    </div>
                  </motion.div>
                ))}
              </div>

                <div className="space-y-3 border-t pt-4">
                  <div className={mutedPanelClass}>
                    <h4 className="mb-2 flex items-center gap-2 font-medium">
                      <ShieldCheck className="h-4 w-4" />
                      Session guidance
                    </h4>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>Keep your answer structured and start with the main point first.</p>
                      <p>Audio is always prioritized for review, and video signals are captured in the background when available.</p>
                      <p>Your interview should continue normally even if camera analysis is not available for part of the recording.</p>
                    </div>
                  </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-medium">
                    <History className="h-4 w-4" />
                    Latest performance
                  </h4>
                  {!latestSession ? (
                    <p className="text-xs text-muted-foreground">Your latest completed interview report will appear here after you finish one session.</p>
                  ) : (
                    <div className={mutedPanelClass}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{latestSession.category}</p>
                          <p className="text-xs text-muted-foreground capitalize">{latestSession.difficulty} interview</p>
                        </div>
                        <Badge variant="outline">{latestSession.overallScore ?? '-'} / 100</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className={cn('rounded-xl border px-3 py-2', darkTheme ? 'bg-background/60' : 'bg-white')}>
                          <p className="text-muted-foreground">Confidence</p>
                          <p className="mt-1 font-semibold text-foreground">{latestSession.confidenceScore ?? '-'} / 100</p>
                        </div>
                        <div className={cn('rounded-xl border px-3 py-2', darkTheme ? 'bg-background/60' : 'bg-white')}>
                          <p className="text-muted-foreground">Questions</p>
                          <p className="mt-1 font-semibold text-foreground">{latestSession.questions?.length ?? 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!sessionId ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  'rounded-3xl border p-10 text-center shadow-sm',
                  darkTheme ? 'border-primary/15 bg-gradient-to-br from-card to-background/70' : 'border-border bg-gradient-to-br from-slate-50 to-white',
                )}
              >
                <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                  <Play className="ml-1 h-12 w-12 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Ready to start a mock interview?</h3>
                <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
                  Select a category on the left to generate five AI interview questions. Each answer is reviewed using your recorded response, transcript, and live video metrics when available.
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                    <div className={cn('rounded-2xl border p-4 text-left', darkTheme ? 'bg-background/60' : 'bg-white')}>
                    <p className="font-medium">Reliable multi-question flow</p>
                    <p className="mt-1 text-sm text-muted-foreground">Each question resets cleanly so you can record, submit, and continue without recorder errors.</p>
                  </div>
                  <div className={cn('rounded-2xl border p-4 text-left', darkTheme ? 'bg-background/60' : 'bg-white')}>
                    <p className="font-medium">Real response analysis</p>
                    <p className="mt-1 text-sm text-muted-foreground">Feedback is based on your recorded answer and video metrics, with fallback data only when a service actually fails.</p>
                  </div>
                  <div className={cn('rounded-2xl border p-4 text-left', darkTheme ? 'bg-background/60' : 'bg-white')}>
                    <p className="font-medium">Saved latest performance</p>
                    <p className="mt-1 text-sm text-muted-foreground">Your latest completed interview remains visible as your current benchmark.</p>
                  </div>
                </div>
              </motion.div>
            ) : sessionComplete && result ? (
              <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InterviewReport
                  overallScore={result.overallScore}
                  confidenceScore={result.confidenceScore ?? result.overallScore}
                  scores={result.scores ?? {}}
                  strengths={result.responses?.flatMap((response: any) => response.evaluation?.strengths ?? []) ?? []}
                  improvements={result.responses?.flatMap((response: any) => response.evaluation?.improvements ?? []) ?? []}
                  feedback={result.responses?.map((response: any) => response.evaluation?.feedback).filter(Boolean).join(' ') || 'Great effort!'}
                  category={result.category}
                  onRetake={handleRetake}
                  onNewInterview={reset}
                />
              </motion.div>
            ) : currentQuestion ? (
              <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <Badge variant="secondary">Question {currentIndex + 1} of {questions.length}</Badge>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className={cn('rounded-2xl border p-3', darkTheme ? 'bg-background/60' : 'bg-white')}>
                      <p className="text-xs text-muted-foreground">Timer</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${timeRemaining < 20 ? 'text-destructive' : 'text-muted-foreground'}`} />
                        <span className={timeRemaining < 20 ? 'font-semibold text-destructive' : 'font-semibold text-foreground'}>
                          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <div className={cn('rounded-2xl border p-3', darkTheme ? 'bg-background/60' : 'bg-white')}>
                      <p className="text-xs text-muted-foreground">Mode</p>
                      <p className="mt-1 font-semibold text-foreground">{recordingMode === 'video' ? 'Video + audio' : 'Audio only'}</p>
                    </div>
                    <div className={cn('rounded-2xl border p-3', darkTheme ? 'bg-background/60' : 'bg-white')}>
                      <p className="text-xs text-muted-foreground">Face samples</p>
                      <p className="mt-1 font-semibold text-foreground">{sampleCount}</p>
                    </div>
                  </div>
                </div>

                <Card className={cn(sectionCardClass, 'bg-muted/30')}>
                  <CardContent className="p-6">
                    <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
                  </CardContent>
                </Card>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border bg-slate-950">
                      <video ref={videoRef} autoPlay muted playsInline className="h-[360px] w-full object-cover" />
                      {!mediaStream && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <VideoOff className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {recordingMode === 'audio' && mediaStream && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-white">
                          <div className="text-center">
                            <Mic className="mx-auto h-12 w-12 opacity-90" />
                            <p className="mt-3 text-sm text-white/70">Audio-only practice mode</p>
                          </div>
                        </div>
                      )}
                      {isRecording && <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">REC</div>}
                      {isRecording && (
                        <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/65 px-3 py-2 text-xs text-white">
                          {faceLoading && recordingMode === 'video'
                            ? 'Camera and microphone are active.'
                            : recordingMode === 'audio'
                              ? 'Audio-only recording is active.'
                              : sampleCount > 0
                                ? 'Recording answer with video and audio analysis.'
                                : 'Recording answer. Keep speaking clearly and stay centered in frame.'}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                      {!showEvaluation && !isRecording && !recordedBlob && (
                        <Button onClick={startRecording}>
                          <Camera className="mr-2 h-4 w-4" />
                          Start recording
                        </Button>
                      )}
                      {!showEvaluation && isRecording && (
                        <Button variant="destructive" onClick={stopRecording}>
                          <Square className="mr-2 h-4 w-4" />
                          Stop
                        </Button>
                      )}
                      {!showEvaluation && recordedBlob && !uploading && (
                        <Button onClick={submitResponse}>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Submit answer
                        </Button>
                      )}
                      {uploading && (
                        <Button disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card className={sectionCardClass}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Sparkles className="h-4 w-4" />
                          Live performance panel
                        </CardTitle>
                        <CardDescription>Live visual coaching updates quietly while you answer.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {scoreCards.length > 0 ? (
                          scoreCards.map((item) => (
                            <div key={item.label} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>{item.label}</span>
                                <span className="font-medium">{item.value}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={cn(mutedPanelClass, 'text-sm text-muted-foreground')}>
                            {recordingMode === 'audio'
                              ? 'Audio-only mode is active. Live visual scoring is paused for this answer.'
                              : 'Start speaking and keep your face visible to build live coaching scores.'}
                          </div>
                        )}
                        <div className={cn(mutedPanelClass, 'text-sm text-muted-foreground')}>
                          <p>{performanceStatus.confidence}</p>
                          <p className="mt-2">{performanceStatus.eyeContact}</p>
                          <p className="mt-2">{performanceStatus.engagement}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={sectionCardClass}>
                      <CardHeader>
                        <CardTitle className="text-base">Answer checklist</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>1. Start with a direct answer before giving details.</p>
                        <p>2. Use one concrete example, result, or project.</p>
                        <p>3. Keep pacing steady and avoid rushing the first 20 seconds.</p>
                        <p>4. In video mode, keep your eyes close to the camera lens.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {showEvaluation && lastEvaluation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Instant feedback
                      </CardTitle>
                      <CardDescription>Score: {lastEvaluation.score}/100</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {lastTranscript ? (
                        <div className={cn(mutedPanelClass, 'text-sm text-muted-foreground')}>
                          <strong className="text-foreground">Transcript preview:</strong> {lastTranscript.slice(0, 320)}
                          {lastTranscript.length > 320 ? '...' : ''}
                        </div>
                      ) : null}
                      {evaluationMeta && !evaluationMeta.transcriptDetected ? (
                        <div className="rounded-2xl border border-amber-400/60 bg-amber-50 p-4 text-sm text-amber-800">
                          No clear spoken answer was detected in this recording, so the review focused on capture quality instead of answer quality. Retrying with clearer audio will give a more accurate review.
                        </div>
                      ) : null}
                      {evaluationMeta?.usedFallbackEvaluation ? (
                        <div className="rounded-2xl border border-amber-400/60 bg-amber-50 p-4 text-sm text-amber-800">
                          The AI review service was temporarily unavailable, so a fallback evaluation was used for this response.
                        </div>
                      ) : null}
                      <p className="text-sm">{lastEvaluation.feedback}</p>
                      {lastEvaluation.strengths?.length ? (
                        <ul className="list-inside list-disc text-sm">
                          {lastEvaluation.strengths.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                      ) : null}
                      {lastEvaluation.improvements?.length ? (
                        <ul className="list-inside list-disc text-sm text-muted-foreground">
                          {lastEvaluation.improvements.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                      ) : null}
                      <Button onClick={isLastQuestion ? () => setSessionComplete(true) : nextQuestion} className="w-full">
                        {isLastQuestion ? 'See full report' : 'Next question'}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Exit
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
