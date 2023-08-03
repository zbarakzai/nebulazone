import "../tailwind.css";
import * as React from "react";
import { useState, useCallback, useRef } from "react";

import { useEventListener } from "../utils/useEvent";
import { isBrowser } from "../utils/isBrowser";
import {
  cancelDefaultEvent,
  getAllDragedFiles,
  checkFileAcceptance,
  getValidationErrors,
} from "../utils/fileValidation";
import { getNumericAspectRatioFromString } from "../utils/crop";
import { DropZoneContext } from "../DropZoneContext";
import { Preview } from "./Preview";

const DROPZONE_CLASSES = {
  default:
    "inset-0 border-dashed rounded-md	flex flex-col justify-center border-2 min-h-[14.5rem]",
  active: "absolute block opacity-100 ",
  nonActive: "relative hidden opacity-0",
  rejected: "bg-danger-800/10 border-danger-800",
  accepted: "bg-primary-800/10 border-primary-800",
};

export type ByteUnits = "B" | "KB" | "MB" | "GB";

export interface DropzoneProps {
  /** Array of drop file paths  */
  files: File[];
  /** Allowed file types */
  accept?: string;
  /** The file type */
  type?: string;
  /** Whether accept multiple file.  */
  allowMultiple?: boolean;
  /** The maximum allowed file size in bytes. */
  maxFileSize?: `${number}${ByteUnits}`;
  /** The minimum allowed file size in bytes. */
  minFileSize?: `${number}${ByteUnits}`;
  /** The maximum allowed total file size in bytes. */
  maxTotalFileSize?: `${number}${ByteUnits}`;
  /** Enables the disabled state. */
  disabled?: boolean;
  /** The elements that will be rendered as children inside the dropzone. */
  children?: string | React.ReactNode;
  /** The layout style for the panel. */
  panelLayout?: "integrated" | "compact" | "circle";
  /** The aspect ratio of the panel. */
  panelAspectRatio?: string | `${string}:${string}`;
  /** Callback invoked on click action. */
  onClick?(event: React.MouseEvent<HTMLElement>): void;
  /** Callback function that activates when the drop operation includes at least one accepted file. */
  onDropAccepted?: (acceptedFiles: File[]) => void;
  /** Callback function triggered when the drop operation includes at least one file that was rejected. */
  onDropRejected?: (rejectedFiles: File[]) => void;
  /** Callback triggered during file drag over the designated area. */
  onDragOver?: () => void;
  /** Callback triggered upon the entry of one or more files into the drag area. */
  onDragEnter?: () => void;
  /** Callback triggered when one or more files exit the drag area. */
  onDragLeave?: () => void;
  /** Callback triggered when files are droped. */
  onDrop?: (
    files: File[],
    acceptedFiles: File[],
    rejectedFiles: File[]
  ) => void;
}

export function DropZone(props: DropzoneProps) {
  const {
    files,
    maxFileSize,
    minFileSize,
    maxTotalFileSize,
    accept,
    type = "file",
    disabled = false,
    allowMultiple = true,
    onClick,
    children,
    panelLayout,
    panelAspectRatio,
    onDrop,
    onDropAccepted,
    onDropRejected,
    onDragEnter,
    onDragOver,
    onDragLeave,
  } = props;

  const [dragEnter, setDragEnter] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const targetNode = useRef<HTMLDivElement>(null);
  const draggedRejectedFiles = useRef<File[]>([]);

  const handleDrop = useCallback(
    (event: DragEvent | React.ChangeEvent<HTMLInputElement>) => {
      cancelDefaultEvent(event);
      if (disabled) return;

      const fileList = getAllDragedFiles(event);

      const { acceptedFiles, rejectedFiles } = checkFileAcceptance(
        fileList,
        accept
      );

      const errors = getValidationErrors(
        rejectedFiles,
        accept,
        minFileSize,
        maxFileSize
      );

      if (onDrop) {
        onDrop(fileList, acceptedFiles, rejectedFiles);
      }

      if (acceptedFiles.length && onDropAccepted) {
        onDropAccepted(acceptedFiles);
      }

      if (rejectedFiles.length && onDropRejected) {
        onDropRejected(rejectedFiles);
      }

      setHasError(false);
      setDragEnter(false);
    },
    [disabled, onDrop, accept, onDropAccepted, onDropRejected]
  );

  const handleDragEnter = useCallback(
    (event: DragEvent | React.ChangeEvent<HTMLInputElement>) => {
      cancelDefaultEvent(event);
      if (disabled) return;

      const dragedFiles = getAllDragedFiles(event);
      const { rejectedFiles } = checkFileAcceptance(dragedFiles, accept);

      if (rejectedFiles.length > 0) {
        draggedRejectedFiles.current = rejectedFiles;
      }

      if (onDragEnter) onDragEnter();
    },
    [disabled, dragEnter, onDragEnter]
  );

  const handleDragLeave = useCallback(
    (event: DragEvent | React.ChangeEvent<HTMLInputElement>) => {
      cancelDefaultEvent(event);
      if (disabled) return;

      if (onDragLeave) onDragLeave();
    },
    [disabled, onDragLeave]
  );

  const handleDragOver = useCallback(
    (event: DragEvent | React.ChangeEvent<HTMLInputElement>) => {
      cancelDefaultEvent(event);
      if (disabled) return;
      if (onDragOver) onDragOver;
    },
    [disabled, onDragOver]
  );

  const handleDragEnterDropZone = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      cancelDefaultEvent(event);
      if (disabled) return;

      if (draggedRejectedFiles.current.length > 0) {
        setHasError(true);
      }
      setDragEnter(true);
    },
    []
  );

  const handleDragLeaveDropZone = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      cancelDefaultEvent(event);
      if (disabled) return;

      setDragEnter(false);
      setHasError(false);
    },
    []
  );

  const dragDropNode = isBrowser() ? document : targetNode.current;

  useEventListener("dragover", handleDragOver, dragDropNode);
  useEventListener("drop", handleDrop, dragDropNode);
  useEventListener("dragenter", handleDragEnter, dragDropNode);
  useEventListener("dragleave", handleDragLeave, dragDropNode);

  const classNames = `${DROPZONE_CLASSES.default} ${
    DROPZONE_CLASSES.accepted
  } ${hasError && dragEnter ? DROPZONE_CLASSES.rejected : ""}`;

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    if (disabled) return;

    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  const getPanelAspectRatio = () => {
    const isShapeCircle = /circle/.test(panelLayout);
    const aspectRatio = isShapeCircle
      ? 1
      : getNumericAspectRatioFromString(panelAspectRatio);
    return aspectRatio;
  };

  const contextValue = {
    files,
    accept,
    type,
    allowMultiple,
    maxFileSize,
    panelLayout,
    minFileSize,
    maxTotalFileSize,
    disabled,
    panelAspectRatio: getPanelAspectRatio(),
    rootNode: targetNode,
  };

  return (
    <DropZoneContext.Provider value={contextValue}>
      <div
        className={`${classNames} hover:cursor-pointer`}
        onDragStart={cancelDefaultEvent}
        onDragEnter={handleDragEnterDropZone}
        onDragLeave={handleDragLeaveDropZone}
        ref={targetNode}
        onClick={handleClick}
        draggable="true"
      >
        <span className="hidden">
          <input
            accept={accept}
            disabled={disabled}
            multiple={allowMultiple}
            onChange={handleDrop}
            type="file"
            ref={inputRef}
            autoComplete="off"
          />
        </span>
        {children}
      </div>
    </DropZoneContext.Provider>
  );
}

DropZone.Preview = Preview;
