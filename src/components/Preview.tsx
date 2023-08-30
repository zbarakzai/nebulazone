import React, {useEffect} from 'react';

import {useImageLoader, usePreviewChecks} from '../utils/usePreview';

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
  /**
    The classess you can add.
   */
  className?: string;
}

export function Preview({
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
  className,
}: PreviewProps) {
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

  const [isPreviewDisallowed] = usePreviewChecks(file, dimensionsData);
  const [image, loadImage] = useImageLoader();

  useEffect(() => {
    loadImage(file);
  }, [file]);

  const panelStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '100%',
    height: '256px',
  };

  return (
    <div data-testid="panel" style={panelStyle} className={`${className}`}>
      {!isPreviewDisallowed && (
        <img style={{position: 'absolute', maxHeight: '100%'}} src={image} />
      )}
    </div>
  );
}
