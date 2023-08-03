// https://github.com/pqina/filepond-plugin-file-validate-size
// This implementation was inspired by file index in the src folder library
// MIT license, Copyright (c) 2020 PQINA | Rik Schennink <rik@pqina.nl>.
// However, we have rewritten the implementation completely in some cases.

/**
 * Options for formatting file size strings.
 */
interface FormatOptions {
  labelBytes?: string;
  labelKilobytes?: string;
  labelMegabytes?: string;
  labelGigabytes?: string;
}

/**
 * Default format options.
 */
const DEFAULT_OPTIONS: FormatOptions = {
  labelBytes: "bytes",
  labelKilobytes: "KB",
  labelMegabytes: "MB",
  labelGigabytes: "GB",
};

type ByteUnits = "B" | "KB" | "MB" | "GB";
export type SizeUnit = `${number}${ByteUnits}`;

/**
 * Converts a byte value to a human-readable string (e.g. '1.5 MB').
 *
 * @param bytes - Number of bytes.
 * @param decimalSeparator - Decimal separator to use in formatted string.
 * @param base - Base for each higher unit (default is 1000 for KB/MB/GB).
 * @param options - Format options.
 * @returns Human-readable string representation of the byte size.
 */
function toNaturalFileSize(
  bytes: number,
  decimalSeparator = ".",
  base = 1000,
  options: FormatOptions = {}
) {
  const {
    labelBytes = DEFAULT_OPTIONS.labelBytes,
    labelKilobytes = DEFAULT_OPTIONS.labelKilobytes,
    labelMegabytes = DEFAULT_OPTIONS.labelMegabytes,
    labelGigabytes = DEFAULT_OPTIONS.labelGigabytes,
  } = options;

  const absBytes = Math.abs(bytes);

  const KB = base;
  const MB = KB * base;
  const GB = MB * base;

  if (absBytes < KB) {
    return `${absBytes} ${labelBytes}`;
  }

  if (absBytes < MB) {
    return `${Math.floor(absBytes / KB)} ${labelKilobytes}`;
  }

  if (absBytes < GB) {
    return `${removeDecimalsWhenZero(
      absBytes / MB,
      1,
      decimalSeparator
    )} ${labelMegabytes}`;
  }

  return `${removeDecimalsWhenZero(
    absBytes / GB,
    2,
    decimalSeparator
  )} ${labelGigabytes}`;
}

/**
 * Removes decimal places from a number if decimals are zero.
 *
 * @param value - Input number.
 * @param decimalCount - Number of decimal places.
 * @param separator - Decimal separator.
 * @returns Number with trailing zero decimals removed.
 */

function removeDecimalsWhenZero(
  value: number,
  decimalCount: number,
  separator: string
) {
  const formatted = value.toFixed(decimalCount);
  const parts = formatted.split(".");

  if (parts[1] === "0") {
    return parts[0];
  }

  return parts.join(separator);
}

/**
 * Replaces placeholders in given string with values from a replacements object.
 *
 * @param inputString - The input string containing placeholders.
 * @param replacements - Object mapping placeholder keys to replacement values.
 * @returns String with placeholders replaced by replacement values.
 */
export function replaceInString(
  inputString: string,
  replacements: { [key: string]: any }
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
export function parseBytes(input: SizeUnit) {
  if (!input) {
    return 0;
  }

  const match = input.trim().match(/^(\d+)([A-Za-z]+)$/);

  const amount = Number(match[1]);
  const unit = match[2].toUpperCase();

  const byteSizes = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };

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
  minSize?: SizeUnit
) {
  const maxFileSizeInByte = parseBytes(maxSize);
  const minFileSizeInByte = parseBytes(minSize);

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
  const maxTotalSizeInBytes = parseBytes(maxTotalSize);

  const totalSize = Array.from(files).reduce((total, item) => {
    return total + item.size;
  }, 0);

  if (totalSize > maxTotalSizeInBytes) {
    return false;
  }

  return true;
}
