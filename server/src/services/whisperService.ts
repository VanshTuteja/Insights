import config from '../config';
import logger from '../utils/logger';
import FormData from 'form-data';

function extensionFromMimeType(mimeType?: string) {
  const normalized = String(mimeType || '').toLowerCase();
  if (normalized.includes('mp4')) return 'mp4';
  if (normalized.includes('mpeg')) return 'mpeg';
  if (normalized.includes('wav')) return 'wav';
  if (normalized.includes('ogg')) return 'ogg';
  if (normalized.includes('webm')) return 'webm';
  return 'webm';
}

export async function transcribeAudio(audioBuffer: Buffer, mimeType?: string): Promise<string> {
  const baseUrl = config.whisper.serviceUrl.replace(/\/$/, '');
  const url = `${baseUrl}/transcribe`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const form = new FormData();
    const extension = extensionFromMimeType(mimeType);
    form.append('file', audioBuffer, { filename: `recording.${extension}`, contentType: mimeType || 'audio/webm' });

    const response = await fetch(url, {
      method: 'POST',
      body: form as any,
      headers: form.getHeaders(),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Whisper service error ${response.status}: ${text}`);
    }
    const data = await response.json() as { transcript?: string };
    return data.transcript || '';
  } catch (err) {
    logger.error('Whisper transcription failed', err);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
