import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useDropZoneContext} from '../DropZoneContext';
import {usePreviewContext} from '../PreviewContext';
import {
  loadImage,
  fixImageOrientation,
  canCreateImageBitmap,
  getImageSizeFromBlob,
  isBitmap,
  isPreviewableImage,
} from './previewUtils';
import {createWorker, BitmapWorker} from './worker';
import type {PreviewProps} from '../components/Preview';
import {getNumericAspectRatioFromString} from './crop';
import {isFile} from './fileValidation';

interface ImageSize {
  width: number;
  height: number;
}

/**
 * Custom hook to preview an image and handle image manipulation.
 * @returns {React.RefObject<HTMLCanvasElement>} canvasRef - Reference to the canvas element for rendering the image.
 */
export const usePreview = () => {
  //define refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContext = usePreviewContext();
  const dropZoneContext = useDropZoneContext();

  const file = previewContext.structure.file;
  const zoomFactor = previewContext.dimensions.imagePreviewZoomFactor || NaN;

  const panelRect = dropZoneContext.rootNode.current?.getBoundingClientRect();

  // Calculate the file URL and memoize it
  const fileURL = useMemo(
    () => (file ? URL.createObjectURL(file) : ''),
    [file],
  );

  //function to load image
  const loadImageThenPreview = useCallback(() => {
    loadImage(fileURL).then((imageData: HTMLImageElement) =>
      previewImageLoaded(imageData),
    );
  }, [fileURL]);

  //function to view the loaded image
  const previewImageLoaded = useCallback((imageData: HTMLImageElement) => {
    // TODO: the oriantation variable should come from EXIF.
    const orientation = -1;
    URL.revokeObjectURL(fileURL);
    const isReversed = [5, 6, 7, 8].includes(orientation);

    let {width, height} = imageData;
    if (isReversed) [width, height] = [height, width];

    showImage(width, height, imageData);
  }, []);

  //function to display image
  const showImage = useCallback(
    (width: number, height: number, imageData: HTMLImageElement) => {
      //calculations
      const pixelDensityFactor = Math.max(1, window.devicePixelRatio * 0.75);
      const scaleFactor = zoomFactor * pixelDensityFactor;

      const previewImageRatio = height / width;
      const previewContainerWidth = panelRect?.width;
      const previewContainerHeight = panelRect?.height;

      let imageWidth = previewContainerWidth;
      let imageHeight = (imageWidth as number) * previewImageRatio;

      if (previewImageRatio > 1) {
        imageWidth = Math.min(
          width,
          (previewContainerWidth as number) * scaleFactor,
        );
        // imageHeight = imageWidth * previewImageRatio;
        imageHeight = previewContainerWidth as number;
      } else {
        imageHeight = Math.min(
          height,
          (previewContainerHeight as number) * scaleFactor,
        );
        imageWidth = imageHeight / previewImageRatio;
      }

      renderImage(width, height, imageData);
    },
    [],
  );

  //function to render the image to the canvas
  const renderImage = (
    width: number,
    height: number,
    imageData: HTMLImageElement,
  ) => {
    // TODO: the oriantation variable should come from EXIF.
    const orientation = -1;

    width = Math.round(width);
    height = Math.round(height);

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    fixImageOrientation(ctx, width, height, orientation);
    ctx?.drawImage(imageData, 0, 0, width, height);
  };

  useEffect(() => {
    if (!file || !panelRect) return;

    if (canCreateImageBitmap(file)) {
      const worker = createWorker(BitmapWorker);
      worker.post({file}, (imageBitmap) => {
        worker.terminate();
        if (!imageBitmap) {
          loadImageThenPreview();
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          previewImageLoaded(imageBitmap);
        }
      });
    } else {
      loadImageThenPreview();
    }
  }, [loadImageThenPreview, previewImageLoaded, file, canvasRef]);

  return canvasRef;
};

/**
 * Custom hook to get the size of an image.
 * @param {File} file - The File object representing the image file.
 * @returns {[ImageSize | null, React.Dispatch<React.SetStateAction<ImageSize | null>>]} - A tuple containing the image size and a function to set the image size state.
 */
export const useImageSize = (
  file: File,
): [
  ImageSize | null,
  React.Dispatch<React.SetStateAction<ImageSize | null>>,
] => {
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);

  useEffect(() => {
    const setImageDimension = async () => {
      if (file) {
        try {
          const size = await getImageSizeFromBlob(file);
          setImageSize(size);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    };

    setImageDimension();
  }, [file]);

  return [imageSize, setImageSize];
};

/**
 * Custom hook to handle item rescaling based on the image size and panel aspect ratio.
 * @param {PreviewProps} props - The props passed to the Preview component.
 * @param {React.RefObject<HTMLElement>} rootNode - Reference to the root element of the component.
 * @param {ImageSize | null} imageSize - The size of the image.
 * @returns {number | null} itemHeight - The height of the preview item after rescaling.
 */
export const useItemRescale = (
  file: File,
  dimensions: PreviewProps['dimensions'],
  rootNode: React.RefObject<HTMLElement>,
  imageSize: ImageSize | null,
): [number, React.Dispatch<React.SetStateAction<number>>] => {
  const [itemHeight, setItemHeight] = useState<number>(0);

  useEffect(() => {
    if (!imageSize) return;
    const orientation = -1;

    if (
      dimensions.panelAspectRatio ||
      dimensions.itemPanelAspectRatio ||
      dimensions.imagePreviewHeight
    )
      return;

    if (!imageSize.width || !imageSize.height) return;

    const isReversed = [5, 6, 7, 8].includes(orientation);
    if (isReversed)
      [imageSize.width, imageSize.height] = [imageSize.height, imageSize.width];

    if (!isBitmap(file) || dimensions.imagePreviewUpscale) {
      const scalar = 2048 / imageSize.width;
      imageSize.width *= scalar;
      imageSize.height *= scalar;
    }

    const imageAspectRatio = imageSize.height / imageSize.width;
    const numaricAspectRatio = dimensions.imageCropAspectRatio
      ? getNumericAspectRatioFromString(dimensions.imageCropAspectRatio)
      : null;

    const previewAspectRatio = numaricAspectRatio || imageAspectRatio;

    const previewHeightMax = Math.max(
      dimensions.imagePreviewMinHeight as number,
      Math.min(imageSize.height, dimensions.imagePreviewMaxHeight as number),
    );

    const rootRect = rootNode.current?.getBoundingClientRect();

    if (rootRect) {
      const previewHeight = Math.min(
        rootRect.width * Number(previewAspectRatio),
        previewHeightMax,
      );

      setItemHeight(previewHeight);
    }
  }, [imageSize, dimensions, rootNode]);

  return [itemHeight, setItemHeight];
};

/**
 * Custom hook to perform preview checks and set the height of the preview item.
 * @param {PreviewProps} input - The props passed to the Preview component.
 * @returns {boolean} - Always returns true.
 */
export const usePreviewChecks = (
  file: File,
  input: PreviewProps['dimensions'],
): [boolean, React.Dispatch<React.SetStateAction<boolean>>, number] => {
  const [isPreviewDisabled, setPreviewDisabled] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    if (!file || !isFile(file)) {
      setPreviewDisabled(true);
    }

    if (!isPreviewableImage(file)) {
      setPreviewDisabled(true);
    }

    // exit if image size is too high and no createImageBitmap support
    // this would simply bring the browser to its knees and that is not what we want

    if (
      input.imagePreviewMaxFileSize &&
      file.size > input.imagePreviewMaxFileSize &&
      !('createImageBitmap' in window)
    ) {
      setPreviewDisabled(true);
    }

    if (input.imagePreviewHeight) {
      setPanelHeight(input.imagePreviewHeight);
    }
  }, [input, file]);

  return [isPreviewDisabled, setPreviewDisabled, panelHeight];
};
