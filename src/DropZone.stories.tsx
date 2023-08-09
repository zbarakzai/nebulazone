import React, {useCallback} from 'react';
import {useState} from 'react';
import {DropZone} from './index';

export default {
  component: DropZone,
};

export function Default() {
  const [files, setFiles] = useState<File[]>([]);

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  const errorMarkupView = (
    <div
      className="absolute inset-0 z-50 w-full h-full bg-red-300/10"
      data-testid="error"
    >
      Error!
    </div>
  );

  return (
    <div style={{padding: '0'}}>
      <DropZone
        onDropAccepted={onDropAccepted}
        accept="image/*"
        errorMarkupView={errorMarkupView}
      >
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

export function WithGridLayout() {
  const [files, setFiles] = useState<File[]>([]);

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  const errorMarkupView = (
    <div
      className="absolute inset-0 z-50 w-full h-full bg-red-300/10"
      data-testid="error"
    >
      Error!
    </div>
  );

  return (
    <div className="p-6">
      <DropZone
        className="relative border-dashed rounded-md border-2 min-h-[14.5rem] hover:cursor-pointer p-2"
        onDropAccepted={onDropAccepted}
        accept="image/*"
        errorMarkupView={errorMarkupView}
      >
        <div className="relative h-full">
          <div className="grid grid-cols-4 gap-2">
            {files.map((file, i) => (
              <div
                className={`${
                  i === 0 && 'col-start-1 col-span-2 row-start-1 row-span-2'
                } border border-gray-300 rounded-lg p-1`}
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
