import { useDropZoneContext } from "../DropZoneContext";
import { ImagePreview } from "./ImagePreview";
import { PreviewContext } from "../PreviewContext";
import {
  useImageSize,
  useItemRescale,
  usePreviewChecks,
} from "../utils/usePreview";

import { STRUCTURE_DEFAULTS, DIMENSION_DEFAULTS } from "../utils/previewUtils";

export interface PreviewProps {
  structure: {
    allowImagePreview?: boolean;
    transparencyIndicator?: "grid" | string;
    allowCrop: boolean;
    file: File;
  };
  dimensions: {
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
}

export function Preview({ structure, dimensions }: PreviewProps) {
  const dropZoneContext = useDropZoneContext();
  const structureData = { ...STRUCTURE_DEFAULTS, ...structure };
  const dimensionsData = { ...DIMENSION_DEFAULTS, ...dimensions };

  const [imageSize] = useImageSize(structure.file);
  const [isPreviewDisallowed] = usePreviewChecks(structure.file, dimensions);

  const [itemHeight] = useItemRescale(
    structure.file,
    dimensionsData,
    dropZoneContext.rootNode,
    imageSize
  );

  const contextValue = {
    dimensionsData,
    dimensions: dimensionsData,
    structure: structureData,
    imageHeight: imageSize?.height,
    imageWidth: imageSize?.width,
    viewHeight: itemHeight,
  };

  return (
    <PreviewContext.Provider value={contextValue}>
      <div id="panel" style={{ height: itemHeight }}>
        {!isPreviewDisallowed && itemHeight && <ImagePreview />}
      </div>
    </PreviewContext.Provider>
  );
}
