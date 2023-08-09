import React from 'react';

import {useDropZoneContext} from '../DropZoneContext';
import {ImagePreview} from './ImagePreview';
import {PreviewContext} from '../PreviewContext';
import {
  useImageSize,
  useItemRescale,
  usePreviewChecks,
} from '../utils/usePreview';

export interface PreviewProps {
  /**
   * The file for which a preview is generated.
   */
  file: File;

  /**
   * Optional flag indicating if an image preview is allowed.
   * Defaults to 'false' if not provided.
   */
  allowImagePreview?: boolean;

  /**
   * Indicator for displaying image transparency.
   * Can be set to 'grid' for a grid pattern or provide any other string value for custom handling.
   */
  transparencyIndicator?: 'grid' | string;

  /**
   * Flag indicating if cropping functionality is allowed.
   */
  allowCrop: boolean;

  /**
   * Optional minimum height for the image preview.
   */
  imagePreviewMinHeight?: number;

  /**
   * Optional maximum height for the image preview.
   */
  imagePreviewMaxHeight?: number;

  /**
   * Specific height for the image preview, if defined.
   */
  imagePreviewHeight?: number;

  /**
   * Optional maximum file size for the image preview.
   */
  imagePreviewMaxFileSize?: number;

  /**
   * Optional aspect ratio for the item panel, represented as a string (e.g. "16:9").
   */
  itemPanelAspectRatio?: string;

  /**
   * Optional aspect ratio for the panel, represented as a string (e.g. "4:3").
   */
  panelAspectRatio?: string;

  /**
   * Optional factor by which the image can be zoomed during preview.
   */
  imagePreviewZoomFactor?: number;

  /**
   * Aspect ratio for cropping the image, represented as a template string (e.g. "1:1").
   */
  imageCropAspectRatio: `${string}:${string}`;

  /**
   * Optional flag indicating if upscaling of the image preview is allowed.
   * Defaults to 'false' if not provided.
   */
  imagePreviewUpscale?: boolean;
}

export function Preview({
  allowImagePreview = true,
  transparencyIndicator = 'grid',
  allowCrop = false,
  file,
  imagePreviewMinHeight = 44,
  imagePreviewMaxHeight = 256,
  imagePreviewHeight,
  imagePreviewMaxFileSize,
  itemPanelAspectRatio,
  panelAspectRatio,
  imagePreviewZoomFactor = 2,
  imageCropAspectRatio = '1:1',
  imagePreviewUpscale = false,
}: PreviewProps) {
  const dropZoneContext = useDropZoneContext();

  const structureData = {
    allowImagePreview,
    transparencyIndicator,
    allowCrop,
    file,
  };

  const dimensionsData = {
    imagePreviewMinHeight,
    imagePreviewMaxHeight,
    imagePreviewHeight,
    imagePreviewMaxFileSize,
    itemPanelAspectRatio,
    panelAspectRatio,
    imagePreviewZoomFactor,
    imageCropAspectRatio,
    imagePreviewUpscale,
  };

  const [imageSize] = useImageSize(file);
  const [isPreviewDisallowed] = usePreviewChecks(file, dimensionsData);

  const [itemHeight] = useItemRescale(
    file,
    dimensionsData,
    dropZoneContext.rootNode,
    imageSize,
  );

  const contextValue = {
    dimensions: dimensionsData,
    structure: structureData,
    imageHeight: imageSize?.height || 0,
    imageWidth: imageSize?.width || 0,
    viewHeight: itemHeight,
  };

  return (
    <PreviewContext.Provider value={contextValue}>
      <div data-testid="panel" className="panel" style={{height: itemHeight}}>
        {!isPreviewDisallowed && itemHeight && <ImagePreview />}
      </div>
    </PreviewContext.Provider>
  );
}
