import { useState, useEffect, useRef, useCallback } from 'react';
import type { ConfidenceMetrics } from '@/lib/interviewApi';
import {
  loadFaceModels,
  detectFaceMetrics,
  aggregateSamples,
  type FaceMetricsSample,
} from '@/lib/faceMetrics';

const DETECTION_INTERVAL_MS = 300;

export interface UseFaceMetricsOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
}

export interface UseFaceMetricsResult {
  /** Current live metrics (last sample) for UI */
  liveMetrics: ConfidenceMetrics | null;
  /** Aggregated metrics to send with upload (call getFinalMetrics when stopping) */
  getFinalMetrics: () => ConfidenceMetrics | null;
  /** Whether models are loading */
  loading: boolean;
  /** Error loading models or running detection */
  error: string | null;
  /** Number of samples collected this session */
  sampleCount: number;
}

/**
 * Runs face detection on the video element at an interval while isActive is true.
 * Call getFinalMetrics() when stopping recording to get aggregated metrics for upload.
 */
export function useFaceMetrics({ videoRef, isActive }: UseFaceMetricsOptions): UseFaceMetricsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<ConfidenceMetrics | null>(null);
  const [sampleCount, setSampleCount] = useState(0);
  const samplesRef = useRef<FaceMetricsSample[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getFinalMetrics = useCallback((): ConfidenceMetrics | null => {
    if (samplesRef.current.length === 0) return null;
    return aggregateSamples(samplesRef.current);
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    let mounted = true;
    samplesRef.current = [];
    setSampleCount(0);
    setLiveMetrics(null);
    setError(null);
    setLoading(true);

    loadFaceModels()
      .then((ok) => {
        if (!mounted || !isActive) return;
        setLoading(false);
        if (!ok) {
          setError('Face detection unavailable');
          return;
        }
        const video = videoRef.current;
        if (!video || video.readyState < 2) {
          setError('Camera not ready');
          return;
        }
        const runDetection = async () => {
          if (!videoRef.current || !isActive) return;
          const sample = await detectFaceMetrics(videoRef.current);
          if (!mounted || !isActive || !sample) return;
          samplesRef.current.push(sample);
          setSampleCount((c) => c + 1);
          setLiveMetrics({
            confidenceScore: sample.confidenceScore,
            eyeContact: sample.eyeContact,
            engagementLevel: sample.engagementLevel,
            smiling: sample.smiling,
          });
        };
        runDetection();
        intervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS);
      })
      .catch((e) => {
        if (mounted) {
          setLoading(false);
          setError(e?.message ?? 'Failed to load face detection');
        }
      });

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, videoRef]);

  return {
    liveMetrics,
    getFinalMetrics,
    loading,
    error,
    sampleCount,
  };
}
