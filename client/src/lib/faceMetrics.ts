/**
 * Live confidence/body-language metrics using face-api loaded from CDN.
 * No npm dependency - loads script at runtime so Vite never has to resolve it.
 */

import type { ConfidenceMetrics } from '@/lib/interviewApi';

const SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
const MODELS_BASE = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';

declare global {
  interface Window {
    faceapi?: {
      nets: {
        tinyFaceDetector: { loadFromUri: (url: string) => Promise<void> };
        faceLandmark68Net: { loadFromUri: (url: string) => Promise<void> };
        faceExpressionNet: { loadFromUri: (url: string) => Promise<void> };
      };
      TinyFaceDetectorOptions: new (opts: { inputSize?: number; scoreThreshold?: number }) => unknown;
      detectAllFaces: (input: HTMLVideoElement, options?: unknown) => {
        withFaceLandmarks: () => { withFaceExpressions: () => Promise<Array<{
          detection: { box: { x: number; y: number; width: number; height: number } };
          landmarks?: {
            positions?: Array<{ x: number; y: number }>;
          };
          expressions?: Record<string, number>;
        }>> };
      };
    };
  }
}

let scriptLoaded = false;
let modelsLoaded = false;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Not in browser'));
      return;
    }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export async function loadFaceModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  try {
    if (!scriptLoaded) {
      await loadScript(SCRIPT_URL);
      scriptLoaded = true;
    }
    const faceapi = window.faceapi;
    if (!faceapi?.nets) {
      console.warn('face-api not available on window');
      return false;
    }
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_BASE),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_BASE),
      faceapi.nets.faceExpressionNet.loadFromUri(MODELS_BASE),
    ]);
    modelsLoaded = true;
    return true;
  } catch (e) {
    console.warn('Face models failed to load, using fallback metrics:', e);
    return false;
  }
}

export interface FaceMetricsSample {
  confidenceScore: number;
  eyeContact: number;
  engagementLevel: number;
  smiling?: number;
}

/**
 * Derive confidence/body-language scores from face-api detection result.
 */
function averagePoint(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return { x: 0, y: 0 };
  const total = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });
  return { x: total.x / points.length, y: total.y / points.length };
}

function sampleFromDetection(
  expressions: Record<string, number> | undefined,
  landmarks: Array<{ x: number; y: number }> | undefined,
  box: { x: number; y: number; width: number; height: number } | undefined,
  videoWidth?: number,
  videoHeight?: number
): FaceMetricsSample | null {
  if (!expressions) return null;
  const happy = expressions.happy ?? 0;
  const neutral = expressions.neutral ?? 0;
  const fearful = expressions.fearful ?? 0;
  const sad = expressions.sad ?? 0;
  const angry = expressions.angry ?? 0;

  const smiling = Math.round(Math.min(100, happy * 100));

  let eyeContact = 0;
  let alignmentPenalty = 35;

  if (landmarks && landmarks.length >= 48 && box) {
    const leftEye = averagePoint(landmarks.slice(36, 42));
    const rightEye = averagePoint(landmarks.slice(42, 48));
    const nose = landmarks[30] ?? averagePoint(landmarks.slice(27, 36));
    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const eyeMidY = (leftEye.y + rightEye.y) / 2;
    const horizontalYaw = Math.abs(nose.x - eyeMidX) / Math.max(1, box.width * 0.18);
    const verticalDrift = Math.abs(nose.y - eyeMidY) / Math.max(1, box.height * 0.2);
    const centerOffsetX =
      videoWidth != null ? Math.abs(box.x + box.width / 2 - videoWidth / 2) / Math.max(1, videoWidth / 2) : 0;
    const centerOffsetY =
      videoHeight != null ? Math.abs(box.y + box.height / 2 - videoHeight / 2) / Math.max(1, videoHeight / 2) : 0;

    alignmentPenalty = horizontalYaw * 30 + verticalDrift * 20 + centerOffsetX * 25 + centerOffsetY * 15;
    eyeContact = Math.round(Math.max(0, Math.min(100, 94 - alignmentPenalty * 1.45)));
  } else if (videoWidth != null && box) {
    const center = videoWidth / 2;
    const offset = Math.abs(box.x + box.width / 2 - center) / center;
    eyeContact = Math.round(Math.max(0, 75 - offset * 90));
  }

  const facePresence =
    box && videoWidth && videoHeight ? Math.min(1, (box.width * box.height) / (videoWidth * videoHeight * 0.22)) : 0.25;
  const engagementLevel = Math.round(
    Math.max(
      0,
      Math.min(100, neutral * 45 + happy * 30 + facePresence * 25 - fearful * 40 - sad * 30 - angry * 25),
    ),
  );
  const confidenceScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        neutral * 35 + happy * 25 + eyeContact * 0.28 + engagementLevel * 0.22 + smiling * 0.1 - fearful * 35 - sad * 25 - angry * 20 - alignmentPenalty,
      ),
    ),
  );

  if (!Number.isFinite(eyeContact)) {
    eyeContact = 0;
  }
  return { confidenceScore, eyeContact, engagementLevel, smiling };
}

export interface FaceMetricsAggregate {
  confidenceScore: number;
  eyeContact: number;
  engagementLevel: number;
  smiling?: number;
  sampleCount: number;
}

const DEFAULT_METRICS: ConfidenceMetrics = {
  confidenceScore: 0,
  eyeContact: 0,
  engagementLevel: 0,
};

/**
 * Run face detection on a video element once.
 */
export async function detectFaceMetrics(
  video: HTMLVideoElement
): Promise<FaceMetricsSample | null> {
  if (video.readyState < 2 || video.videoWidth === 0) return null;
  const faceapi = window.faceapi;
  if (!faceapi?.nets?.tinyFaceDetector) return null;
  try {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5,
    });
    const detections = await faceapi
      .detectAllFaces(video, options)
      .withFaceLandmarks()
      .withFaceExpressions();
    if (detections.length === 0) return null;
    const d = detections[0];
    const box = d.detection.box;
    return sampleFromDetection(
      d.expressions,
      d.landmarks?.positions,
      box,
      video.videoWidth,
      video.videoHeight,
    );
  } catch {
    return null;
  }
}

/**
 * Aggregate samples into final ConfidenceMetrics (averages).
 */
export function aggregateSamples(samples: FaceMetricsSample[]): ConfidenceMetrics {
  if (samples.length === 0) return DEFAULT_METRICS;
  const n = samples.length;
  const sum = samples.reduce(
    (acc, s) => ({
      confidenceScore: acc.confidenceScore + s.confidenceScore,
      eyeContact: acc.eyeContact + s.eyeContact,
      engagementLevel: acc.engagementLevel + s.engagementLevel,
      smiling: (acc.smiling ?? 0) + (s.smiling ?? 0),
    }),
    { confidenceScore: 0, eyeContact: 0, engagementLevel: 0, smiling: 0 }
  );
  return {
    confidenceScore: Math.round(sum.confidenceScore / n),
    eyeContact: Math.round(sum.eyeContact / n),
    engagementLevel: Math.round(sum.engagementLevel / n),
    smiling: Math.round((sum.smiling ?? 0) / n),
  };
}

export { DEFAULT_METRICS };
