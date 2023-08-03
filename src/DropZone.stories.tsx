import { useState } from "react";
import { DropZone } from "./index";

export default {
  component: DropZone,
};

export function Default() {
  const [files, setFiles] = useState<File[]>([]);

  const onDropAccepted = (acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  };

  return (
    <div style={{ padding: "0" }}>
      <DropZone
        onDropAccepted={onDropAccepted}
        accept="image/*"
        type="image"
        files={files}
      >
        <div>List of all files</div>
        {files.map((file, i) => (
          <div key={i}>
            <DropZone.Preview
              structure={{ file, allowCrop: true }}
              dimensions={{ imageCropAspectRatio: "1:1" }}
              key={i}
            ></DropZone.Preview>
            <span>{file.name}</span>
          </div>
        ))}
      </DropZone>
    </div>
  );
}
