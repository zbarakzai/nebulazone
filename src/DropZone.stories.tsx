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
              structure={{file, allowCrop: true}}
              dimensions={{imageCropAspectRatio: '1:1'}}
              key={`${file.name}-${i}`}
            ></DropZone.Preview>
            <span>{file.name}</span>
          </div>
        ))}
      </DropZone>
    </div>
  );
}
