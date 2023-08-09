export const transforms = {
  1: () => [1, 0, 0, 1, 0, 0],
  2: (width: number) => [-1, 0, 0, 1, width, 0],
  3: (width: number, height: number) => [-1, 0, 0, -1, width, height],
  4: (_: number, height: number) => [1, 0, 0, -1, 0, height],
  5: () => [0, 1, 1, 0, 0, 0],
  6: (_: number, height: number) => [0, 1, -1, 0, height, 0],
  7: (width: number, height: number) => [0, -1, -1, 0, height, width],
  8: (width: number) => [0, -1, 1, 0, 0, width],
};

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
 * Check if the browser supports the `createImageBitmap` API and the given file can be processed as a bitmap.
 * Firefox versions before 58 may freeze when running `createImageBitmap` in a Web Worker, so this function detects those versions and returns false for support.
 *
 * @param {File} file - The file to check.
 * @returns {boolean} `true` if the browser supports `createImageBitmap` and the file can be processed as a bitmap, `false` otherwise.
 */
export function canCreateImageBitmap(file: File) {
  // Firefox versions before 58 will freeze when running createImageBitmap
  // in a Web Worker so we detect those versions and return false for support
  const userAgent = window.navigator.userAgent;
  const isFirefox = userAgent.match(/Firefox\/([0-9]+)\./);
  const firefoxVersion = isFirefox ? parseInt(isFirefox[1]) : null;
  if (firefoxVersion !== null && firefoxVersion <= 58) return false;

  return 'createImageBitmap' in window && isBitmap(file);
}

/**
 * Check if the given file is a bitmap image (not an SVG).
 *
 * @param {File} file - The file to check.
 * @returns {boolean} `true` if the file is a bitmap image (not an SVG), `false` otherwise.
 */
export const isBitmap = (file: File): boolean =>
  /^image/.test(file.type) && !/svg/.test(file.type);

/**
 * Applies the necessary transformations to correct the image orientation on the canvas context.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @param {number} orientation - The orientation of the image (a value between 1 and 8).
 */
export const fixImageOrientation = (
  ctx: CanvasRenderingContext2D | null,
  width: number,
  height: number,
  orientation: number,
): void => {
  // no orientation supplied
  if (orientation === -1) {
    return;
  }

  const transformResult = transforms[orientation as keyof typeof transforms](
    width,
    height,
  );

  // eslint-disable-next-line prefer-spread, @typescript-eslint/no-explicit-any
  ctx?.transform.apply(ctx, transformResult as any);
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
