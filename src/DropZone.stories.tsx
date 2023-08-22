import React, {useCallback} from 'react';
import {useState} from 'react';
import {DropZone} from './index';

export default {
  component: DropZone,
};

export interface ValidationError {
  type: 'INVALID_FILE_TYPE' | 'INVALID_FILE_SIZE' | 'TOTAL_SIZE_EXCEEDED';
  message: string;
}

export function Default() {
  const [files, setFiles] = useState<File[]>([]);

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  return (
    <div>
      <DropZone onDropAccepted={onDropAccepted} accept="image/*">
        <div>List of all files</div>
        {files.map((file, i) => (
          <div key={i}>
            <DropZone.Preview
              file={file}
              allowCrop={true}
              imageCropAspectRatio="1:1"
              key={`${file.name}-${i}`}
            />
            <span>{file.name}</span>
          </div>
        ))}
      </DropZone>
    </div>
  );
}

export function WithErrorMessage() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  const onDrop = useCallback(
    (_: File[], __: File[], ___: File[], errors: ValidationError[]) => {
      if (errors.length > 0) {
        setErrorMessage(errors.map((err) => err.message));
      }
    },
    [],
  );

  const errorMarkupView = (
    <div
      className="absolute flex space-y-2 flex-col justify-center items-center inset-0 z-50 w-full h-full bg-[rgba(232,76,133,.1)] text-red-400"
      data-testid="error"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-[#e84c85]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>

      <h3 className="text-sm font-medium text-[#e84c85]">
        Invalid file type. Please upload an image with one of the following
        extensions: .jpg, .jpeg, .png, .gif, .bmp.
      </h3>
    </div>
  );

  return (
    <div>
      <div className="mb-4">
        {errorMessage && errorMessage?.length > 0 && (
          <ErrorAlerts title="Error adding this file:" errors={errorMessage} />
        )}
      </div>
      <DropZone
        accept="image/*"
        className={`relative border-dashed rounded-md border-2 min-h-[14.5rem] hover:cursor-pointer p-2 ${
          error && 'border-[#e84c85]'
        }`}
        onDropAccepted={onDropAccepted}
        onDrop={onDrop}
        setError={setError}
      >
        {files.map((file, i) => (
          <div key={i}>
            <DropZone.Preview
              file={file}
              allowCrop={true}
              imageCropAspectRatio="1:1"
              key={`${file.name}-${i}`}
            />
            <span>{file.name}</span>
          </div>
        ))}
        {error && errorMarkupView}
      </DropZone>
    </div>
  );
}

export function WithAcceptMessage() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [dragEnter, SetDragEnter] = useState<boolean>(false);

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  const acceptMarkupView = (
    <div
      className="absolute flex space-y-2 flex-col justify-center items-center inset-0 z-50 w-full h-full bg-[#6078ff]/10 text-[#6078ff]"
      data-testid="error"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-[#6078ff]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
        />
      </svg>

      <h3 className="text-sm font-medium">
        Toss it over and we&apos;ll catch it!
      </h3>
    </div>
  );

  return (
    <div>
      <DropZone
        accept="image/*"
        className={`relative border-dashed rounded-md border-2 min-h-[14.5rem] hover:cursor-pointer p-2 ${
          error && 'border-[#e84c85]'
        } ${!error && dragEnter && 'border-[#6078ff]'}`}
        onDropAccepted={onDropAccepted}
        setError={setError}
        setFileEnterZone={SetDragEnter}
      >
        {files.map((file, i) => (
          <div key={i}>
            <DropZone.Preview
              file={file}
              allowCrop={true}
              imageCropAspectRatio="1:1"
              key={`${file.name}-${i}`}
            />
            <span>{file.name}</span>
          </div>
        ))}
        {!error && dragEnter && acceptMarkupView}
      </DropZone>
    </div>
  );
}

export function WithGridLayout() {
  const [files, setFiles] = useState<File[]>([]);

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  return (
    <div className="p-6">
      <DropZone
        className="relative border-dashed rounded-md border-2 min-h-[14.5rem] hover:cursor-pointer p-2"
        onDropAccepted={onDropAccepted}
        accept="image/*"
      >
        <div className="relative h-full">
          <div className="grid grid-cols-4 gap-2">
            {files.map((file, i) => (
              <div
                className={`${
                  i === 0 && 'col-start-1 col-span-2 row-start-1 row-span-2'
                } border border-gray-300 rounded-lg p-1 ${
                  i !== 0 ? 'max-h-[125px]' : ''
                }`}
                key={i}
              >
                <div className="relative flex items-center justify-center w-full h-full p-0 m-0">
                  <DropZone.Preview
                    file={file}
                    allowCrop={true}
                    imageCropAspectRatio="1:1"
                    key={`${file.name}-${i}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DropZone>
    </div>
  );
}

function ErrorAlerts({title, errors}: {title: string; errors: string[]}) {
  return (
    <div className="bg-[rgba(232,76,133,.1)] rounded-md p-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-[#e84c85]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-[#e84c85]">{title}</div>
          <div className="mt-2 text-sm text-[#e84c85]">
            <ul className="space-y-1 pl-4 list-disc list-inside">
              {errors.map((err, i) => (
                <li key={`${i}-${err}`}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
