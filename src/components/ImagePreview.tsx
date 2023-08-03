import { useRef, useEffect, useState } from "react";
import { useDropZoneContext } from "../DropZoneContext";
import { usePreviewContext } from "../PreviewContext";
import { ClipView } from "./ClipView";
import { useLoadCropData } from "../utils/crop";
import type { PreviewContextType } from "../PreviewContext";
import type { DropZoneContextType } from "../DropZoneContext";

const calculateClipSize = (
  ref: React.RefObject<HTMLDivElement>,
  privewContext: PreviewContextType,
  cropData: ReturnType<typeof useLoadCropData>,
  dropZoneContext: DropZoneContextType
) => {
  const { panelAspectRatio, allowMultiple } = dropZoneContext;
  const { dimensions, imageHeight, imageWidth } = privewContext;

  const imageAspectRatio = imageHeight / imageWidth;

  let aspectRatio = cropData.crop.aspectRatio || imageAspectRatio;

  const containerRect = ref.current.getBoundingClientRect();

  // calculate container size
  const containerWidth = containerRect?.width;
  const containerHeight = containerRect?.height;

  let fixedPreviewHeight = dimensions.imagePreviewHeight;
  const minPreviewHeight = dimensions.imagePreviewMinHeight;
  const maxPreviewHeight = dimensions.imagePreviewMaxHeight;

  const calculatedPanelRatio =
    typeof panelAspectRatio === "string"
      ? parseInt(panelAspectRatio)
      : panelAspectRatio;

  if (panelAspectRatio && !allowMultiple) {
    fixedPreviewHeight = containerWidth * calculatedPanelRatio;
    aspectRatio = panelAspectRatio;
  }

  // determine clip width and height
  let clipHeight =
    fixedPreviewHeight !== null
      ? fixedPreviewHeight
      : Math.max(
          minPreviewHeight,
          Math.min(
            containerWidth * parseFloat(`${aspectRatio}`),
            maxPreviewHeight
          )
        );

  let clipWidth = clipHeight / parseFloat(`${aspectRatio}`);
  if (clipWidth > containerWidth) {
    clipWidth = containerWidth;
    clipHeight = clipWidth * parseFloat(`${aspectRatio}`);
  }

  if (clipHeight > containerHeight) {
    clipHeight = containerHeight;
    clipWidth = containerHeight / parseFloat(`${aspectRatio}`);
  }

  return { height: clipWidth, width: clipHeight };
};

export function ImagePreview() {
  const ref = useRef<HTMLDivElement>();
  const dropZoneContext = useDropZoneContext();
  const previewContext = usePreviewContext();

  const [clipSize, setClipSize] = useState<{ height: number; width: number }>({
    height: 0,
    width: 0,
  });

  const cropData = useLoadCropData();

  useEffect(() => {
    const newClipSize = calculateClipSize(
      ref,
      previewContext,
      cropData,
      dropZoneContext
    );

    setClipSize(newClipSize);
  }, [previewContext, dropZoneContext]);

  return (
    <div className="w-full h-full image-preview" ref={ref}>
      <ClipView height={clipSize.height} width={clipSize.width} />
    </div>
  );
}
