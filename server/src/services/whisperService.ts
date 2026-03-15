import config from '../config';
import logger from '../utils/logger';
import FormData from 'form-data';

export async function transcribeAudio(audioBuffer: Buffer, mimeType?: string): Promise<string> {
  const baseUrl = config.whisper.serviceUrl.replace(/\/$/, '');
  const url = `${baseUrl}/transcribe`;
  try {
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'recording.webm', contentType: mimeType || 'audio/webm' });

    const response = await fetch(url, {
      method: 'POST',
      body: form as any,
      headers: form.getHeaders(),
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
  }
}
