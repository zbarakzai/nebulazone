import { usePreviewContext } from "../PreviewContext";
import { isFile } from "./fileValidation";

export interface CropOptions {
  center?: {
    x: number;
    y: number;
  };
  rotation?: number;
  zoom?: number;
  aspectRatio?: number;
  flip?: {
    horizontal?: boolean;
    vertical?: boolean;
  };
}

/**
 * Represents a rectangle with width and height properties.
 */
interface Rect {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface DotType {
  x: number;
  y: number;
}

/**
 * Checks if a value is null or undefined.
 *
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is null or undefined
 */
export const isEmpty = (value: unknown) => {
  return value == null;
};

/**
 * Converts an aspect ratio string to a numeric ratio.
 *
 * @param {string|number} aspectRatio - The aspect ratio value.
 * @returns {number|undefined} The numeric aspect ratio, or undefined if unable to parse.
 */
export function getNumericAspectRatioFromString(
  aspectRatio: string
): number | string {
  if (isEmpty(aspectRatio)) {
    return aspectRatio;
  }

  if (/:/.test(aspectRatio)) {
    const parts = aspectRatio.split(":");
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    return denominator / numerator;
  }

  return parseFloat(aspectRatio);
}

/**
 * Checks if the given file is an image based on its MIME type.
 *
 * @param {File} file - The file to check if it is an image.
 * @returns {boolean} - True if the file is an image, otherwise false.
 */
export function isImage(file: File) {
  return /^image/.test(file.type);
}

/**
 * Checks if cropping is allowed for the given file.
 *
 * @param {File} file - The file to check if cropping is allowed.
 * @param {boolean} allowCrop - A boolean indicating whether image cropping is allowed.
 * @returns {boolean} - True if cropping is allowed for the file, otherwise false.
 */
export function allowCrop(file: File, allowCrop: boolean) {
  // Check if the item is an image and image cropping is allowed
  return !!(!file || !allowCrop || !isImage(file));
}

/**
 * Checks if the given value is an object.
 *
 * @param {any} value - The value to check if it is an object.
 * @returns {boolean} - True if the value is an object, otherwise false.
 */
export function isObject(value: unknown) {
  return typeof value === "object" && value !== null;
}

/**
 * Checks if the given value is a number.
 *
 * @param {any} value - The value to check if it is a number.
 * @returns {boolean} - True if the value is a number, otherwise false.
 */
export function isNumber(value: unknown) {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Creates a crop object for a given file if cropping is allowed.
 *
 * @param {File} file - The file to create a crop for.
 * @param {boolean} cropAllowed - A boolean indicating whether image cropping is allowed for the file.
 * @returns {{
 *   currentCrop: CropOptions;
 *   setImageCrop: (crop: CropOptions) => CropOptions | undefined;
 *   setImageCropCenter: (center: CropOptions["center"]) => CropOptions | undefined;
 *   setImageCropZoom: (zoom: CropOptions["zoom"]) => CropOptions | undefined;
 *   setImageCropRotation: (rotation: CropOptions["rotation"]) => CropOptions | undefined;
 *   setImageCropFlip: (flip: CropOptions["flip"]) => CropOptions | undefined;
 *   setImageCropAspectRatio: (newAspectRatio: string) => CropOptions | undefined;
 * }} - An object containing functions to set crop options if cropping is allowed.
 */
export function createCrop(file: File, cropAllowed: boolean) {
  const currentCrop: CropOptions = {};

  const setImageCrop = (crop: CropOptions) => {
    if (!allowCrop(file, cropAllowed) || !isObject(crop.center)) return;
    return crop;
  };

  const setImageCropCenter = (center: CropOptions["center"]) => {
    if (!allowCrop(file, cropAllowed) || !isObject(center)) return;

    return Object.assign({}, currentCrop, { center });
  };

  const setImageCropZoom = (zoom: CropOptions["zoom"]) => {
    if (!allowCrop(file, cropAllowed) || !isNumber(zoom)) return;

    return Object.assign({}, currentCrop, { zoom: Math.max(1, zoom) });
  };

  const setImageCropRotation = (rotation: CropOptions["rotation"]) => {
    if (!allowCrop(file, cropAllowed) || !isNumber(rotation)) return;

    return Object.assign({}, currentCrop, { rotation });
  };

  const setImageCropFlip = (flip: CropOptions["flip"]) => {
    if (!allowCrop(file, cropAllowed) || !isObject(flip)) return;

    return Object.assign({}, currentCrop, { flip });
  };

  const setImageCropAspectRatio = (newAspectRatio: string) => {
    if (!allowCrop(file, cropAllowed) || typeof newAspectRatio === "undefined")
      return;

    const aspectRatio = getNumericAspectRatioFromString(newAspectRatio);

    const newCrop: CropOptions = {
      center: {
        x: 0.5,
        y: 0.5,
      },
      flip: currentCrop
        ? Object.assign({}, currentCrop.flip)
        : {
            horizontal: false,
            vertical: false,
          },
      rotation: 0,
      zoom: 1,
      aspectRatio: aspectRatio as number,
    };

    return newCrop;
  };

  return {
    currentCrop,
    setImageCrop,
    setImageCropCenter,
    setImageCropZoom,
    setImageCropRotation,
    setImageCropFlip,
    setImageCropAspectRatio,
    file,
  };
}

/**
 * Calculates a centered crop rectangle with a given aspect ratio inside a container.
 *
 * @param {CropContainer} container - The container with width and height properties.
 * @param {number} aspectRatio - The desired aspect ratio for the crop rectangle.
 * @returns {CropRect} The centered crop rectangle with x, y, width, and height properties.
 */
export function getCenteredCropRect(
  container: { height: number; width: number },
  aspectRatio: number
) {
  let width = container.width;
  let height = width * aspectRatio;

  if (height > container.height) {
    height = container.height;
    width = height / aspectRatio;
  }

  const x = (container.width - width) * 0.5;
  const y = (container.height - height) * 0.5;

  return {
    x,
    y,
    width,
    height,
  };
}

/**
 * Calculates the zoom factor required to fit an image rectangle within a rotated crop rectangle.
 *
 * @param {Rect} imageRect - The rectangle representing the size of the image.
 * @param {Rect} cropRect - The rectangle representing the size of the crop area.
 * @param {number} rotation - The rotation angle of the crop rectangle in radians.
 * @param {{ x: number; y: number }} center - The center position of the crop rectangle as a ratio of its size.
 * @returns {number} The zoom factor required to fit the image within the rotated crop rectangle.
 */
export function getImageRectZoomFactor(
  imageRect: { height: number; width: number },
  cropRect: Rect,
  rotation: number,
  center: { x: number; y: number }
) {
  // calculate available space round image center position
  const cx = center.x > 0.5 ? 1 - center.x : center.x;
  const cy = center.y > 0.5 ? 1 - center.y : center.y;
  const imageWidth = cx * 2 * imageRect.width;
  const imageHeight = cy * 2 * imageRect.height;

  // calculate rotated crop rectangle size
  const rotatedCropSize = getRotatedRectSize(cropRect, rotation);

  // calculate scalar required to fit image
  return Math.max(
    rotatedCropSize.width / imageWidth,
    rotatedCropSize.height / imageHeight
  );
}

/**
 * Creates a vector with given x and y coordinates.
 *
 * @param {number} x - The x-coordinate of the vector.
 * @param {number} y - The y-coordinate of the vector.
 * @returns {Vector} The created vector with x and y coordinates.
 */
const createVector = (x: number, y: number) => ({ x, y });

/**
 * Calculates the offset point on the edge of a rectangle after rotation.
 *
 * @param {number} length - The length of the edge of the rectangle.
 * @param {number} rotation - The rotation angle in radians.
 * @returns {Vector} The offset point on the edge (x and y coordinates).
 */
function getOffsetPointOnEdge(length: number, rotation: number) {
  const a = length;

  const A = 1.5707963267948966;
  const B = rotation;
  const C = 1.5707963267948966 - rotation;

  const sinA = Math.sin(A);
  const sinB = Math.sin(B);
  const sinC = Math.sin(C);
  const cosC = Math.cos(C);
  const ratio = a / sinA;
  const b = ratio * sinB;
  const c = ratio * sinC;

  return createVector(cosC * b, cosC * c);
}

/**
 * Calculates the dot product of two vectors (points) in 2D space.
 *
 * @param {Vector} a - The first vector with x and y coordinates.
 * @param {Vector} b - The second vector with x and y coordinates.
 * @returns {number} The dot product of the two vectors.
 */
const vectorDot = (a: DotType, b: DotType) => a.x * b.x + a.y * b.y;

/**
 * Calculates the subtraction of two vectors (points) in 2D space.
 *
 * @param {Vector} a - The first vector with x and y coordinates.
 * @param {Vector} b - The second vector with x and y coordinates.
 * @returns {Vector} The result of subtracting vector b from vector a.
 */
const vectorSubtract = (a: DotType, b: DotType) =>
  createVector(a.x - b.x, a.y - b.y);

/**
 * Calculates the distance between two vectors (points) in 2D space.
 *
 * @param {Vector} a - The first vector with x and y coordinates.
 * @param {Vector} b - The second vector with x and y coordinates.
 * @returns {number} The distance between the two vectors.
 */
const vectorDistance = (a: DotType, b: DotType) =>
  Math.sqrt(vectorDistanceSquared(a, b));

/**
 * Calculates the squared distance between two vectors (points) in 2D space.
 *
 * @param {Vector} a - The first vector with x and y coordinates.
 * @param {Vector} b - The second vector with x and y coordinates.
 * @returns {number} The squared distance between the two vectors.
 */
const vectorDistanceSquared = (a: DotType, b: DotType) =>
  vectorDot(vectorSubtract(a, b), vectorSubtract(a, b));

/**
 * Calculates the size of a rectangle after rotation.
 *
 * @param {Rect} rect - The rectangle to be rotated.
 * @param {number} rotation - The rotation angle in radians.
 * @returns {Rect} The size of the rectangle after rotation (width and height).
 */
function getRotatedRectSize(rect: Rect, rotation: number) {
  const w = rect.width;
  const h = rect.height;

  const hor = getOffsetPointOnEdge(w, rotation);
  const ver = getOffsetPointOnEdge(h, rotation);

  const tl = createVector(rect.x + Math.abs(hor.x), rect.y - Math.abs(hor.y));
  const tr = createVector(
    rect.x + rect.width + Math.abs(ver.y),
    rect.y + Math.abs(ver.x)
  );

  const bl = createVector(
    rect.x - Math.abs(ver.y),
    rect.y + rect.height - Math.abs(ver.x)
  );

  return {
    width: vectorDistance(tl, tr),
    height: vectorDistance(tl, bl),
  };
}

/**
 * Custom hook to load crop data for image files.
 * If this is not an image or cropping is not allowed, it returns null.
 * If cropping is allowed, it returns an object containing the crop data.
 * @returns {{
 *   item: CropItem;
 *   crop: CropData;
 * }} | null - An object containing the item and crop data if cropping is allowed, otherwise null.
 */
export function useLoadCropData() {
  const privewContext = usePreviewContext();

  // if this is not an image we do not have any business cropping it and we'll continue with the unaltered dataset
  if (
    !isFile(privewContext.structure.file) ||
    !isImage(privewContext.structure.file) ||
    !privewContext.structure.allowCrop
  ) {
    return null;
  }

  // ! it's important to track how to load the crop
  // const crop = undefined;

  // if (crop) {
  //   return { item: createCrop(file, cropAllowed), crop };
  // }

  const newCrop = {
    center: {
      x: 0.5,
      y: 0.5,
    },
    flip: {
      horizontal: false,
      vertical: false,
    },
    rotation: 0,
    zoom: 1,
    aspectRatio: privewContext.dimensions.imageCropAspectRatio
      ? getNumericAspectRatioFromString(
          privewContext.dimensions.imageCropAspectRatio
        )
      : null,
    scaleToFit: undefined,
  } as const;

  return {
    item: createCrop(
      privewContext.structure.file,
      privewContext.structure.allowCrop
    ),
    crop: { ...newCrop },
  };
}
