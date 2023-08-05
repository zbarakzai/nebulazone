// https://github.com/pqina/filepond-plugin-file-validate-size
// This implementation was inspired by file index in the src folder library
// MIT license, Copyright (c) 2020 PQINA | Rik Schennink <rik@pqina.nl>.
// However, we have rewritten the implementation completely in some cases.

type ByteUnits = 'B' | 'KB' | 'MB' | 'GB';
export type SizeUnit = `${number}${ByteUnits}`;

/**
 * Replaces placeholders in given string with values from a replacements object.
 *
 * @param inputString - The input string containing placeholders.
 * @param replacements - Object mapping placeholder keys to replacement values.
 * @returns String with placeholders replaced by replacement values.
 */
export function replaceInString(
  inputString: string,
  replacements: {[key: string]: string},
) {
  return inputString.replace(/{([a-zA-Z]+)}/g, (_, group) => {
    return replacements[group];
  });
}

/**
 * Convert a string like "10MB" to bytes.
 *
 * @param input - The input string to convert
 * @returns The number of bytes as a BigInt
 * @throws {ValidationError} On invalid input
 */
export function parseBytes(input: SizeUnit | undefined) {
  if (!input) {
    return 0;
  }

  const match = input.trim().match(/^(\d+)([A-Za-z]+)$/);

  if (!match) {
    return;
  }

  const amount = Number(match[1]);

  const byteSizes = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };

  const unit = match[2].toUpperCase() as keyof typeof byteSizes;

  return amount * byteSizes[unit];
}

/**
 * Validates file sizes to be within min and max bounds.
 *
 * @param {File[]} files - Array of files to validate
 * @param {string} maxSize - Maximum allowed size string, e.g. "5MB"
 * @param {string} minSize - Minimum allowed size string, e.g. "5KB"
 * @returns {Object}
 *    acceptedFiles: Array of files that passed size validation
 *    rejectedFiles: Array of files that failed size validation
 */
export function isValidFileSize(
  file: File,
  maxSize?: SizeUnit,
  minSize?: SizeUnit,
) {
  const maxFileSizeInByte = parseBytes(maxSize) as number;
  const minFileSizeInByte = parseBytes(minSize) as number;

  if (maxSize && file.size > maxFileSizeInByte) {
    return false;
  }

  if (minSize && file.size < minFileSizeInByte) {
    return false;
  }

  return true;
}

/**
 * Validates that the total size of files is within the max total size limit.
 *
 * @param {File[]} files - Array of files to validate
 * @param {string} maxTotalSize - Maximum total size string, e.g. "10MB"
 * @returns {boolean} Whether total size is valid within max limit
 */
export function validateTotalMaxSize(files: File[], maxTotalSize: SizeUnit) {
  const maxTotalSizeInBytes = parseBytes(maxTotalSize) as number;

  const totalSize = Array.from(files).reduce((total, item) => {
    return total + item.size;
  }, 0);

  if (totalSize > maxTotalSizeInBytes) {
    return false;
  }

  return true;
}
