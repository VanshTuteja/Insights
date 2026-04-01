const readCanvasBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not prepare image for upload.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });

export const prepareAvatarFile = async (file: File) => {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Selected image could not be processed.'));
      img.src = imageUrl;
    });

    const maxDimension = 512;
    const scale = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not prepare image for upload.');
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await readCanvasBlob(canvas, 0.86);
    const preparedFile = new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'avatar'}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    const previewUrl = URL.createObjectURL(blob);

    return { file: preparedFile, previewUrl };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};
