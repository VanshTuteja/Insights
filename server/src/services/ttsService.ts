import config from '../config';
import logger from '../utils/logger';

const GOOGLE_CLOUD_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

type GoogleTtsResponse = {
  audioContent?: string;
};

function toDataUrl(buffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function splitText(text: string, maxLength = 180) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return [normalized];
  }

  const parts: string[] = [];
  let remaining = normalized;

  while (remaining.length > maxLength) {
    let splitIndex = remaining.lastIndexOf(' ', maxLength);
    if (splitIndex < 1) splitIndex = maxLength;
    parts.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trim();
  }

  if (remaining) parts.push(remaining);
  return parts;
}

async function synthesizeChunk(chunk: string, voiceName?: string) {
  if (!config.googleTts.apiKey) {
    logger.warn('GOOGLE_TTS_API_KEY not set, skipping question audio synthesis');
    return null;
  }

  const url = new URL(GOOGLE_CLOUD_TTS_URL);
  url.searchParams.set('key', config.googleTts.apiKey);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { text: chunk },
      voice: {
        languageCode: config.googleTts.language,
        ...(voiceName ? { name: voiceName } : {}),
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    }),
  });

  if (!response.ok) {
    const responseData = await response.text();
    logger.error('Google Cloud TTS request failed', {
      status: response.status,
      statusText: response.statusText,
      responseData,
      language: config.googleTts.language,
      voice: voiceName || '(default voice for language)',
    });
    return null;
  }

  const data = await response.json() as GoogleTtsResponse;
  if (!data.audioContent) {
    logger.error('Google Cloud TTS returned no audio content', {
      language: config.googleTts.language,
      voice: voiceName || '(default voice for language)',
    });
    return null;
  }

  return Buffer.from(data.audioContent, 'base64');
}

export async function synthesizeInterviewQuestion(text: string): Promise<string | null> {
  const chunks = splitText(text, 160);

  try {
    const audioChunks: Buffer[] = [];

    for (const chunk of chunks) {
      let audioChunk = await synthesizeChunk(chunk, config.googleTts.voice);

      if (!audioChunk && config.googleTts.voice) {
        logger.warn('Retrying Google Cloud TTS with default language voice', {
          language: config.googleTts.language,
          requestedVoice: config.googleTts.voice,
        });
        audioChunk = await synthesizeChunk(chunk);
      }

      if (!audioChunk) {
        return null;
      }

      audioChunks.push(audioChunk);
    }

    const merged = Buffer.concat(audioChunks);
    return toDataUrl(merged, 'audio/mpeg');
  } catch (error) {
    logger.error('Google Cloud TTS synthesis error', {
      error,
      language: config.googleTts.language,
      voice: config.googleTts.voice,
    });
    return null;
  }
}
