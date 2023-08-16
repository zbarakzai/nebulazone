export const getImageSizeFromBlob = (
  file: File,
): Promise<{width: number; height: number}> => {
  return new Promise<{width: number; height: number}>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const width: number = image.naturalWidth;
      const height: number = image.naturalHeight;
      resolve({width, height});
    };

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target && event.target.result) {
        image.src = event.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Error loading image.'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Check if a file is of type image and can be viewed in a canvas.
 * @param file - The file to be checked.
 * @returns `true` if the file is an image and can be previewed in a canvas, otherwise `false`.
 */
export const isPreviewableImage = (file: File): boolean => {
  return /^image/.test(file.type);
};

/**
 * Loads an image from the specified URL and returns a Promise that resolves
 * to the loaded HTMLImageElement.
 *
 * @param {string} url - The URL of the image to load.
 * @returns {Promise<HTMLImageElement>} A Promise that resolves to the loaded image.
 */
export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve(img);
    };

    img.onerror = (error: Event | string) => {
      reject(error instanceof Event ? (error as ErrorEvent).error : error);
    };

    // Set the crossOrigin attribute to allow cross-origin image loading.
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}
