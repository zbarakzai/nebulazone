import React from 'react';
import {useEffect, useRef, useMemo} from 'react';

import {usePreviewContext} from '../PreviewContext';
import {
  getCenteredCropRect,
  getImageRectZoomFactor,
  useLoadCropData,
} from '../utils/crop';
import {usePreview} from '../utils/usePreview';

interface ClipViewProps {
  /** The width of the clip container. */
  width: number;
  /** The height of the clip container. */
  height: number;
}

type StypleTypes = {
  width: number;
  height: number;
  cropData: ReturnType<typeof useLoadCropData>;
  imageHeight: number;
  imageWidth: number;
};

export function computeStyles({
  width,
  height,
  cropData,
  imageHeight,
  imageWidth,
}: StypleTypes) {
  const {crop} = cropData;

  const stage = {
    x: 0,
    y: 0,
    width,
    height,
    center: {
      x: width * 0.5,
      y: height * 0.5,
    },
  };

  const image = {
    width: imageWidth,
    height: imageHeight,
  };

  const origin = {
    x: crop.center.x * image.width,
    y: crop.center.y * image.height,
  };

  const translation = {
    x: stage.center.x - image.width * crop.center.x,
    y: stage.center.y - image.height * crop.center.y,
  };

  const rotation = Math.PI * 2 + (crop?.rotation % (Math.PI * 2));

  const cropAspectRatio = crop.aspectRatio || image.height / image.width;

  const shouldLimit =
    typeof crop?.scaleToFit === 'undefined' || crop.scaleToFit;

  const stageZoomFactor = getImageRectZoomFactor(
    image,
    getCenteredCropRect(stage, parseInt(`${cropAspectRatio}`)),
    rotation,
    shouldLimit ? crop.center : {x: 0.5, y: 0.5},
  );

  const scale = crop.zoom * stageZoomFactor;

  const wrapper = {
    transformOrigin: `${origin.x}px ${origin.y}px`,
    transform: `translate3d(${translation.x}px, ${translation.y}px, 0px) scale3d(${scale}, ${scale}, 1) rotateZ(${rotation}rad)`,
    height: `${image.height}px`,
    width: `${image.width}px`,
  };

  const horizontal = crop.flip.horizontal ? -1 : 1;
  const vertical = crop.flip.vertical ? -1 : 1;

  const bitmap = {
    transform: `scaleX(${horizontal}) scaleY(${vertical})`,
  };

  return {wrapper, bitmap};
}

export function ClipView(props: ClipViewProps) {
  const {width, height} = props;
  const previewContext = usePreviewContext();
  const cropData = useLoadCropData();
  const canvasRef = usePreview();

  const clipRef = useRef<HTMLDivElement>(null);
  const canvaWrapperRef = useRef<HTMLDivElement>(null);
  const bitmapRef = useRef<HTMLDivElement>(null);

  const {structure, imageHeight, imageWidth} = previewContext;

  useEffect(() => {
    if (!structure.transparencyIndicator) return;
    if (clipRef.current) {
      if (structure.transparencyIndicator === 'grid') {
        clipRef.current.setAttribute('data-transparency-indicator', 'grid');
      } else {
        clipRef.current.setAttribute('data-transparency-indicator', 'color');
      }
    }
  }, [clipRef, structure.transparencyIndicator]);

  // Move the complex transformation logic into useMemo
  const transformStyles = useMemo(
    () => computeStyles({width, height, cropData, imageHeight, imageWidth}),
    [width, height, cropData, imageHeight, imageWidth],
  );

  // Set the styles in useEffect
  useEffect(() => {
    if (canvaWrapperRef.current) {
      Object.assign(canvaWrapperRef.current.style, transformStyles.wrapper);
      if (bitmapRef.current) {
        Object.assign(bitmapRef.current.style, transformStyles.bitmap);
      }
    }
  }, [canvaWrapperRef, bitmapRef, transformStyles]);

  return (
    <div
      data-testid="clip-view"
      style={{width, height}}
      className="clip-view"
      ref={clipRef}
    >
      <div ref={canvaWrapperRef} className="canva-wrapper">
        <div
          ref={bitmapRef}
          className="flex flex-col items-center w-full image-bitmap"
        >
          <canvas
            className="absolute max-h-full after:pb-[100%] after:w-full"
            ref={canvasRef}
          ></canvas>
        </div>
      </div>
    </div>
  );
}
