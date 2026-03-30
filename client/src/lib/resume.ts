import axios from 'axios';

const createSafeFileName = (name?: string) =>
  `${(name || 'resume').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'resume'}.pdf`;

const extractMessageFromBlob = async (blob: Blob) => {
  try {
    const text = await blob.text();
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    return parsed.message || parsed.error || 'Resume request failed.';
  } catch {
    return 'Resume request failed.';
  }
};

async function getResumeBlob(userId: string) {
  const response = await axios.get(`/upload/resume/download/${userId}`, {
    responseType: 'blob',
  });

  const contentType = String(response.headers?.['content-type'] || '').toLowerCase();
  const blob = new Blob([response.data], { type: contentType || 'application/pdf' });

  if (!contentType.includes('application/pdf')) {
    throw new Error(await extractMessageFromBlob(blob));
  }

  return blob;
}

export async function downloadResumeFile(userId: string, fileName?: string) {
  const blob = await getResumeBlob(userId);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = createSafeFileName(fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function openResumeFile(userId: string) {
  const openedWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!openedWindow) {
    throw new Error('Please allow pop-ups to view the resume.');
  }

  openedWindow.document.write('<title>Opening resume...</title><p style="font-family:Segoe UI,sans-serif;padding:24px;">Loading resume...</p>');

  try {
    const blob = await getResumeBlob(userId);
    const url = window.URL.createObjectURL(blob);
    openedWindow.location.href = url;

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    openedWindow.close();
    throw error;
  }
}
