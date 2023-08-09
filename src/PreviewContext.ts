import {createContext, useContext} from 'react';

export type Structure = {
  allowImagePreview?: boolean;
  transparencyIndicator?: 'grid' | string;
  allowCrop: boolean;
  file: File;
};

export type Dimension = {
  imagePreviewMinHeight?: number;
  imagePreviewMaxHeight?: number;
  imagePreviewHeight?: number;
  imagePreviewMaxFileSize?: number;
  itemPanelAspectRatio?: string;
  panelAspectRatio?: string;
  imagePreviewZoomFactor?: number;
  imageCropAspectRatio: `${string}:${string}`;
  imagePreviewUpscale?: boolean;
};

export type PreviewContextType = {
  structure: Structure;
  dimensions: Dimension;
  /** The height of the image */
  imageHeight: number;
  /** The width of the image */
  imageWidth: number;
  /** The image container height */
  viewHeight: number;
};

export const PreviewContext = createContext<PreviewContextType | null>(null);

export const usePreviewContext = () => {
  const currentPreviewContext = useContext(PreviewContext);

  if (!currentPreviewContext) {
    throw new Error(
      'usePrivewContext has to be used within <PreviewContext.Provider>',
    );
  }

  return currentPreviewContext;
};
