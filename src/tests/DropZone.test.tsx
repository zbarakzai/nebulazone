import React from 'react';
import {describe, vi, it, beforeEach, expect, afterEach} from 'vitest';
import {render, fireEvent, cleanup} from '@testing-library/react';

import {DropZone} from '../components/DropZone';

interface FileType {
  name: string;
  type: string;
  size?: number;
}
const files = [
  {name: 'jpeg file', type: 'image/jpeg'},
  {name: 'png file', type: 'image/png'},
  {name: 'text file', type: 'text/plain'},
  {name: 'html file', type: 'text/html'},
  {name: 'json file', type: 'application/json'},
  {name: 'word file', type: 'application/msword'},
  {name: 'excel file', type: 'application/vnd.ms-excel'},
  {name: 'powerpoint file', type: 'application/vnd.ms-powerpoint'},
  {name: 'pdf file', type: 'application/pdf'},
  {name: 'svg file', type: 'image/svg+xml'},
  {name: 'gif file', type: 'image/gif'},
  {name: 'bmp file', type: 'image/bmp'},
  {name: 'webp file', type: 'image/webp'},
  {name: 'zip file', type: 'application/zip'},
  {name: 'audio file', type: 'audio/mpeg'},
  {name: 'video file', type: 'video/mp4'},
];

const rejectedFiles = [{name: 'jpeg file', type: 'image/jpeg', size: 3000000}];

const imageFiles = [
  {name: 'jpeg file', type: 'image/jpeg'},
  {name: 'png file', type: 'image/png'},
  {name: 'svg file', type: 'image/svg+xml'},
  {name: 'gif file', type: 'image/gif'},
  {name: 'bmp file', type: 'image/bmp'},
  {name: 'webp file', type: 'image/webp'},
];

const nonImageFiles = [
  {name: 'text file', type: 'text/plain'},
  {name: 'html file', type: 'text/html'},
  {name: 'json file', type: 'application/json'},
  {name: 'word file', type: 'application/msword'},
  {name: 'excel file', type: 'application/vnd.ms-excel'},
  {name: 'powerpoint file', type: 'application/vnd.ms-powerpoint'},
  {name: 'pdf file', type: 'application/pdf'},
  {name: 'zip file', type: 'application/zip'},
  {name: 'audio file', type: 'audio/mpeg'},
  {name: 'video file', type: 'video/mp4'},
];

const errors = [
  {
    type: 'INVALID_FILE_TYPE',
    message: 'text file is not supported. File type must be image/*.',
  },
  {
    type: 'INVALID_FILE_TYPE',
    message: 'html file is not supported. File type must be image/*.',
  },
  {
    type: 'INVALID_FILE_TYPE',
    message: 'json file is not supported. File type must be image/*.',
  },
  {
    type: 'INVALID_FILE_TYPE',
    message: 'word file is not supported. File type must be image/*.',
  },
  {
    type: 'INVALID_FILE_TYPE',
    message: 'excel file is not supported. File type must be image/*.',
  },
  {
    type: 'INVALID_FILE_TYPE',
    message: 'powerpoint file is not supported. File type must be image/*.',
  },
  {
    type: 'INVALID_FILE_TYPE',
    message: 'pdf file is not supported. File type must be image/*.',
  },
  {
    type: 'INVALID_FILE_TYPE',
    message: 'zip file is not supported. File type must be image/*.',
  },
  {
    type: 'INVALID_FILE_TYPE',
    message: 'audio file is not supported. File type must be image/*.',
  },
  {
    type: 'INVALID_FILE_TYPE',
    message: 'video file is not supported. File type must be image/*.',
  },
];

describe('<DropZone />', () => {
  let spy = vi.fn();

  beforeEach(() => {
    spy = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('invokes the onDrop callback with dropped files event', () => {
    const {getByTestId} = render(<DropZone onDrop={spy} />);
    const dropZone = getByTestId('dropzone');
    const event = createFileEvent('drop', files);
    fireEvent(dropZone, event);

    expect(spy).toHaveBeenCalledWith(files, files, [], []);
  });

  it('invokes onDrop with all accepted, files that has only image/* types.', () => {
    const {getByTestId} = render(<DropZone accept="image/*" onDrop={spy} />);
    const dropZone = getByTestId('dropzone');
    const event = createFileEvent('drop', files);
    fireEvent(dropZone, event);

    expect(spy).toHaveBeenCalledWith(
      files,
      imageFiles,
      expect.anything(),
      expect.anything(),
    );
  });

  it('invokes onDrop with all accepted, files that has only image/* types and rejected files.', () => {
    const {getByTestId} = render(<DropZone accept="image/*" onDrop={spy} />);
    const dropZone = getByTestId('dropzone');
    const event = createFileEvent('drop', files);
    fireEvent(dropZone, event);

    expect(spy).toHaveBeenCalledWith(
      files,
      imageFiles,
      nonImageFiles,
      expect.anything(),
    );
  });

  it('invokes the onDrop, passing a list containing all errors.', () => {
    const {getByTestId} = render(<DropZone accept="image/*" onDrop={spy} />);
    const dropZone = getByTestId('dropzone');
    const event = createFileEvent('drop', files);
    fireEvent(dropZone, event);

    expect(spy).toHaveBeenCalledWith(files, imageFiles, nonImageFiles, errors);
  });

  it('invokes the onDropAccepted callback with dropped files event', () => {
    const {getByTestId} = render(
      <DropZone accept="image/*" onDropAccepted={spy} />,
    );
    const dropZone = getByTestId('dropzone');
    const event = createFileEvent('drop', files);
    fireEvent(dropZone, event);

    expect(spy).toHaveBeenCalledWith(imageFiles);
  });

  it('invokes the onDropRejected callback with rejected dropped files', () => {
    const {getByTestId} = render(
      <DropZone accept="image/*" onDropRejected={spy} />,
    );
    const dropZone = getByTestId('dropzone');
    const event = createFileEvent('drop', files);
    fireEvent(dropZone, event);

    expect(spy).toHaveBeenCalledWith(nonImageFiles);
  });

  it('invokes the onDragEnter callback with on dragenter event', () => {
    render(<DropZone accept="image/*" onDragEnter={spy} />);
    const event = createFileEvent('dragenter', files);
    fireEvent(document, event);

    expect(spy).toHaveBeenCalled();
  });

  it('invokes the onDragLeave callback with on dragleave event', () => {
    render(<DropZone accept="image/*" onDragLeave={spy} />);
    const event = createFileEvent('dragleave', files);
    fireEvent(document, event);

    expect(spy).toHaveBeenCalled();
  });

  it('invokes the onDragOver callback with on dragover event', () => {
    const {getByTestId} = render(
      <DropZone accept="image/*" onDragOver={spy} />,
    );
    const event = createFileEvent('dragover', files);
    fireEvent(getByTestId('dropzone'), event);

    expect(spy).toHaveBeenCalled();
  });

  it("when disabled, it doesn't invoke onClick.", () => {
    const {getByTestId} = render(<DropZone disabled onClick={spy} />);
    fireEvent.click(getByTestId('dropzone'));
    expect(spy).not.toHaveBeenCalled();
  });

  it("when disabled, it doesn't invoke any callbacks.", () => {
    const dropZone = render(
      <DropZone
        disabled
        onDrop={spy}
        onDragOver={spy}
        onDragEnter={spy}
        onDragLeave={spy}
        onDropAccepted={spy}
        onDropRejected={spy}
      />,
    );
    // Over
    const event = createFileEvent('dragover', files);
    fireEvent(document, event);
    expect(spy).not.toHaveBeenCalled();
    // Eenter
    const eventEnter = createFileEvent('dragleave', files);
    fireEvent(document, eventEnter);
    expect(spy).not.toHaveBeenCalled();
    // Leave
    const eventLeave = createFileEvent('dragleave', files);
    fireEvent(document, eventLeave);
    expect(spy).not.toHaveBeenCalled();
    // Drop
    const drop = dropZone.getByTestId('dropzone');
    const dropEvent = createFileEvent('drop', files);
    fireEvent(drop, dropEvent);
    expect(spy).not.toHaveBeenCalled();
  });

  it('when onClick event fired, it invoke the onClick.', () => {
    const {getByTestId} = render(<DropZone onClick={spy} />);
    fireEvent.click(getByTestId('dropzone'));
    expect(spy).toHaveBeenCalled();
  });

  it('invokes the onDrop callback with on dragover event only accepting one file.', () => {
    const {getByTestId} = render(
      <DropZone accept="image/*" onDrop={spy} allowMultiple={false} />,
    );
    const dropZone = getByTestId('dropzone');
    const event = createFileEvent('drop', imageFiles);
    fireEvent(dropZone, event);

    expect(spy).toHaveBeenCalledWith(
      imageFiles,
      [{name: 'jpeg file', type: 'image/jpeg'}],
      expect.anything(),
      expect.anything(),
    );
  });

  it('invokes onDrop with all accepted, files that has not exceeded 2MB.', () => {
    const {getByTestId} = render(
      <DropZone accept="image/*" onDrop={spy} maxFileSize="2MB" />,
    );

    const event = createFileEvent('drop', rejectedFiles);
    fireEvent(getByTestId('dropzone'), event);

    expect(spy).toHaveBeenCalledWith(
      expect.anything(),
      [],
      rejectedFiles,
      expect.anything(),
    );
  });

  it('invokes onDrop with all accepted, files that has no less than 5MB and pass the error messages.', () => {
    const {getByTestId} = render(
      <DropZone accept="image/*" onDrop={spy} minFileSize="5MB" />,
    );

    const event = createFileEvent('drop', rejectedFiles);
    fireEvent(getByTestId('dropzone'), event);

    expect(spy).toHaveBeenCalledWith(expect.anything(), [], rejectedFiles, [
      {
        message: 'jpeg file size must be at least 5MB',
        type: 'INVALID_FILE_SIZE',
      },
    ]);
  });

  it('render the error view markup on dragenter event.', async () => {
    const errorMarkupView = <div data-testid="error">Error!</div>;

    const {getByTestId, queryByTestId} = render(
      <DropZone
        accept="image/*"
        onDrop={spy}
        maxFileSize="1MB"
        errorMarkupView={errorMarkupView}
      />,
    );

    const enterEvent = createFileEvent('dragenter', rejectedFiles);
    fireEvent(document, enterEvent);
    fireEvent(getByTestId('dropzone'), enterEvent);

    expect(getByTestId('error')).not.toBeNull()

    const leaveEvent = createFileEvent('dragleave', rejectedFiles);
    fireEvent(getByTestId('dropzone'), leaveEvent);

    expect(queryByTestId('error')).toBeNull()
  });
});

function createFileEvent(name: string, files: FileType[]) {
  const event = new CustomEvent(name, {
    bubbles: true,
    cancelable: true,
  });

  Object.defineProperty(event, 'dataTransfer', {
    enumerable: true,
    value: {files},
  });

  return event;
}
