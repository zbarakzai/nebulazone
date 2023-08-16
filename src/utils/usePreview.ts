import {useEffect, useState} from 'react';

import type {Dimension} from '../PreviewContext';
import {isPreviewableImage} from './previewUtils';
import {isFile} from './fileValidation';

export const useImageLoader = () => {
  const [image, setImage] = useState<string>();

  const loadImage = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ensure reader.result is a string before setting the state
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return [image, loadImage] as const;
};

/**
 * Custom hook to perform preview checks and set the height of the preview item.
 * @param {PreviewProps} input - The props passed to the Preview component.
 * @returns {boolean} - Always returns true.
 */
export const usePreviewChecks = (
  file: File,
  input: Dimension,
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
