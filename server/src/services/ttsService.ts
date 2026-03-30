import config from '../config';
import logger from '../utils/logger';

function toDataUrl(buffer: ArrayBuffer, mimeType: string) {
  return `data:${mimeType};base64,${Buffer.from(buffer).toString('base64')}`;
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

export async function synthesizeInterviewQuestion(text: string): Promise<string | null> {
  const chunks = splitText(text, 160);

  try {
    const audioChunks: Buffer[] = [];

    for (const chunk of chunks) {
      const url = new URL('https://translate.google.com/translate_tts');
      url.searchParams.set('ie', 'UTF-8');
      url.searchParams.set('client', 'tw-ob');
      url.searchParams.set('tl', config.googleTts.language);
      url.searchParams.set('q', chunk);

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!response.ok) {
        const responseData = await response.text();
        logger.error('Google TTS request failed', {
          status: response.status,
          statusText: response.statusText,
          responseData,
          language: config.googleTts.language,
          voice: config.googleTts.voice,
        });
        return null;
      }

      const audio = await response.arrayBuffer();
      audioChunks.push(Buffer.from(audio));
    }

    const merged = Buffer.concat(audioChunks);
    return toDataUrl(merged.buffer.slice(merged.byteOffset, merged.byteOffset + merged.byteLength), 'audio/mpeg');
  } catch (error) {
    logger.error('Google TTS synthesis error', { error, language: config.googleTts.language, voice: config.googleTts.voice });
    return null;
  }
}
