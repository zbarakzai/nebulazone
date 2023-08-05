// This implementation was inspired by file index in the src folder library
// MIT license, Copyright (c) 2019 PQINA | Rik Schennink <rik@pqina.nl>.
// However, we have rewritten the implementation completely in some cases.

import type {SizeUnit} from './fileSizeValidation';
import {isValidFileSize} from './fileSizeValidation';

type WildcardMimeType = `${string}/*`;
type ExtractMimeType = string;

interface FileExtensionMap {
  [key: string]: string;
}

type Item = string | {type: string};

interface FileValidationResult {
  acceptedFiles: File[];
  rejectedFiles: File[];
  files: File[];
}

export interface ValidationError {
  type: 'INVALID_FILE_TYPE' | 'INVALID_FILE_SIZE' | 'TOTAL_SIZE_EXCEEDED';
  message: string;
}

/**
 * Check if the given mimeType matches the wildcard mimeType.
 * @param mimeType The mimeType to compare.
 * @param wildcard The wildcard mimeType to match against.
 * @returns true if the mimeType matches the wildcard; otherwise, false.
 */
function mimeTypeMatchesWildCard(
  mimeType: ExtractMimeType,
  wildcard: WildcardMimeType,
) {
  const mimeTypeGroup = (/^[^/]+/.exec(mimeType) || []).pop();
  const wildcardGroup = wildcard.slice(0, -2);
  return mimeTypeGroup === wildcardGroup;
}

/**
 * Check if the given user input mime type is valid based on the accepted types.
 * @param acceptedTypes An array of accepted mime types.
 * @param userInputType The user input mime type to validate.
 * @returns true if the user input mime type is valid; otherwise, false.
 */
function isValidMimeType(
  acceptedTypes: WildcardMimeType[],
  userInputType: string,
) {
  return acceptedTypes.some((acceptedType) => {
    if (acceptedType.endsWith('*')) {
      return mimeTypeMatchesWildCard(userInputType, acceptedType);
    }

    return acceptedType === userInputType;
  });
}

/**
 * Guess the MIME type based on the provided file extension.
 * @param extension The file extension.
 * @returns The guessed MIME type.
 */
function guessMimeType(extension = ''): string {
  const imageExtensions: string[] = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'svg',
    'tiff',
  ];

  const textExtensions: string[] = ['css', 'csv', 'html', 'txt'];

  const extensionMimeMap: FileExtensionMap = {
    zip: 'zip|compressed',
    epub: 'application/epub+zip',
  };

  // eslint-disable-next-line no-param-reassign
  extension = extension.toLowerCase();

  if (imageExtensions.includes(extension)) {
    if (extension === 'jpg') {
      return 'image/jpeg';
    }

    if (extension === 'svg') {
      return 'image/svg+xml';
    }

    return `image/${extension}`;
  }

  if (textExtensions.includes(extension)) {
    return `text/${extension}`;
  }

  return extensionMimeMap[extension] || '';
}

/**
 * Get the file extension from the given filename.
 * @param filename The filename to extract the extension from.
 * @returns The file extension or an empty string if no extension is found.
 */
function getExtensionFromFilename(filename: string) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() : '';
}

/**
 * Get the filename from the given URL.
 * @param url The URL to extract the filename from.
 * @returns The filename or an empty string if no filename is found.
 */
function getFilenameFromURL(url: string) {
  return url.split('/').pop()?.split('?').shift();
}

/**
 * Get the MIME type of the given item.
 * @param item The item to get the MIME type from. It can be a URL or an object with a 'type' property.
 * @returns The MIME type of the item, or an empty string if it cannot be determined.
 */
function getItemType(item: Item) {
  if (isObject(item)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return item.type || '';
  }

  if (typeof item === 'string') {
    const filename = getFilenameFromURL(item as string);
    const extension = getExtensionFromFilename(filename as string);

    if (extension) {
      return guessMimeType(extension);
    }
  }

  return '';
}

/**
 * Check if the given item is an object.
 * @param item The item to check.
 * @returns true if the item is an object; otherwise, false.
 */
function isObject(item: Item) {
  return typeof item === 'object' && item !== null;
}

/**
 * Validates if a file is acceptable based on the list of accepted file types.
 *
 * @param file - The file to validate.
 * @param acceptedFileTypes - The accepted file types. Can be a string, array or undefined.
 * @returns True if the file is valid, false otherwise.
 */
export function isFileAcceptable(
  file: File,
  acceptedFileTypes: string | string[] | undefined,
) {
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types
  if (file.type === 'application/x-moz-file') {
    return true;
  }

  if (!file || !acceptedFileTypes) {
    return true;
  }

  const fileType = getItemType(file);
  const acceptedFilesArray = Array.isArray(acceptedFileTypes)
    ? acceptedFileTypes
    : acceptedFileTypes.split(',');

  return isValidMimeType(acceptedFilesArray as WildcardMimeType[], fileType);
}

/**
 * Get the FileList from a change event.
 *
 * @param {ChangeEvent} event - The change event
 * @returns {File[] | []} The files from the change target
 */
function getFilesFromChangeEvent(
  event: React.ChangeEvent<HTMLInputElement> | DragEvent,
) {
  const target = event.target as HTMLInputElement;

  if (target.files) {
    return Array.from(target.files);
  }

  return [];
}

/**
 * Get the FileList from a drag event.
 *
 * @param {DragEvent} event - The drag event
 * @returns {File[] | []} The files from the drag event
 */
function getFilesFromDragEvent(event: DragEvent) {
  const dataTransfer = event.dataTransfer;

  if (dataTransfer?.files?.length) {
    return Array.from(dataTransfer.files);
  }

  if (dataTransfer?.items?.length) {
    return Array.from(dataTransfer.items);
  }
  return [];
}

/**
 * Get the FileList from a drag or change event.
 *
 * @param {DragEvent | ChangeEvent} event - The drag or change event
 * @returns {File[]} The files from the event
 */
export function getAllDragedFiles(
  event: DragEvent | React.ChangeEvent<HTMLInputElement>,
): File[] {
  if (['dragenter', 'dragover', 'drop'].includes(event.type)) {
    if (event.constructor === DragEvent) {
      return getFilesFromDragEvent(event) as File[];
    }
  }

  if (event.type === 'change') {
    return getFilesFromChangeEvent(event);
  }

  return [];
}

/**
 * Prevent the default behavior and stop event propagation.
 * Should be called for events that need to be canceled.
 *
 * @param event - The event object
 */
export function cancelDefaultEvent(
  event:
    | React.DragEvent<HTMLDivElement>
    | DragEvent
    | React.ChangeEvent<HTMLInputElement>,
) {
  // Prevent default browser behavior
  event.preventDefault();

  // Stop event from bubbling up
  event.stopPropagation();
}

/**
 * Validates a list of files and separates them into accepted and rejected files based on the given criteria.
 *
 * @param {File[] | DataTransferItem[]} files - An array of File objects or DataTransferItem objects to validate.
 * @returns {FileValidationResult} An object containing acceptedFiles and rejectedFiles arrays.
 *
 * @typedef {Object} FileValidationResult
 * @property {File[]} acceptedFiles - An array of File objects that have met the acceptance criteria.
 * @property {File[]} rejectedFiles - An array of File objects that have not met the acceptance criteria.
 */
export function checkFileAcceptance(
  files: File[],
  accept?: string,
  maxSize?: SizeUnit,
  minSize?: SizeUnit,
): FileValidationResult {
  const acceptedFiles: File[] = [];
  const rejectedFiles: File[] = [];

  const processFile = (file: File) => {
    if (
      isFileAcceptable(file, accept) &&
      isValidFileSize(file, maxSize, minSize)
    ) {
      acceptedFiles.push(file);
    } else {
      rejectedFiles.push(file);
    }
  };

  Array.from(files).forEach(processFile);

  return {files, acceptedFiles, rejectedFiles};
}

/**
 * Generates error objects for rejected files based on validation criteria.
 *
 * @param {File[]} rejectedFiles - Array of files that failed validation
 * @param {string|string[]} acceptedTypes - Accepted file types
 * @param {string} minSize - Minimum file size
 * @param {string} maxSize - Maximum file size
 * @returns {ValidationError[]} Array of error objects for each rejected file
 */
export function getValidationErrors(
  rejectedFiles: File[],
  acceptedTypes?: string | string[],
  minSize?: SizeUnit,
  maxSize?: SizeUnit,
): ValidationError[] {
  const errors: ValidationError[] = [];

  rejectedFiles.forEach((file) => {
    if (!isFileAcceptable(file, acceptedTypes)) {
      errors.push({
        type: 'INVALID_FILE_TYPE',
        message: `${file.name} is not supported. File type must be ${acceptedTypes}.`,
      });
    }

    if (isValidFileSize(file, maxSize, minSize)) {
      let message = ``;

      if (minSize && maxSize) {
        message = `${file.name} size must be no more than ${maxSize} and less than ${minSize}`;
      }

      if (minSize && !maxSize) {
        message = `${file.name} size must be at least ${minSize}`;
      }

      if (maxSize && !minSize) {
        message = `size must be no more than ${maxSize}`;
      }
      errors.push({
        type: 'INVALID_FILE_SIZE',
        message,
      });
    }
  });

  return errors;
}

/**
 * Checks if the given value is a File or Blob with a name property.
 *
 * @param {unknown} value - The value to check if it is a File or Blob.
 * @returns {boolean} - True if the value is a File or Blob with a name property, otherwise false.
 */
export const isFile = (value: unknown): boolean => {
  return !!(
    value instanceof File ||
    (value instanceof Blob && typeof value.name === 'string')
  );
};
