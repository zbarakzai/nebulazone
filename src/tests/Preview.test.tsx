import React from 'react';
import {describe, vi, it, beforeEach, expect, afterEach} from 'vitest';
import {render, cleanup} from '@testing-library/react';

import {DropZone} from '../components/DropZone';

const imageFiles = [
  {name: 'jpeg file', type: 'image/jpeg'},
  {name: 'png file', type: 'image/png'},
  {name: 'svg file', type: 'image/svg+xml'},
  {name: 'gif file', type: 'image/gif'},
  {name: 'bmp file', type: 'image/bmp'},
  {name: 'webp file', type: 'image/webp'},
];

const mocks = vi.hoisted(() => {
  return {
    useImageSize: vi.fn(),
    useItemRescale: vi.fn(),
    usePreviewChecks: vi.fn(),
    usePreview: vi.fn(),
  };
});

vi.mock('../utils/usePreview', () => ({
  useImageSize: mocks.useImageSize,
  useItemRescale: mocks.useItemRescale,
  usePreviewChecks: mocks.usePreviewChecks,
  usePreview: mocks.usePreview,
}));

beforeEach(() => {
  mocks.useImageSize.mockReturnValue([{width: 100, height: 100}]);
  mocks.useItemRescale.mockReturnValue([150]);
  mocks.usePreviewChecks.mockReturnValue([false]);
  mocks.usePreview.mockReturnValue(() => {
    const canvasRef = {current: null};
    return canvasRef;
  });
});

afterEach(() => {
  vi.resetAllMocks();
  cleanup();
});

function Component() {
  return (
    <DropZone>
      <div>List of all files</div>
      {imageFiles.map((file, i) => {
        const fakeFile = new File(['Hello World!'], file.name, {
          type: file.type,
        });
        return (
          <div key={i}>
            <DropZone.Preview
            file={fakeFile}
            allowCrop={true}
            imageCropAspectRatio='1:1'
            key={`${file.name}-${i}`}
            />
            <span>{file.name}</span>
          </div>
        );
      })}
    </DropZone>
  );
}

describe('<Preview />', () => {
  it('render ImagePreview when preview is allowed', () => {
    const {queryAllByTestId} = render(<Component />);
    expect(queryAllByTestId('panel')).not.toBeNull();
  });

  it('does not render ImagePreview when preview is disallowed', async () => {
    mocks.usePreviewChecks.mockReturnValue([true]);
    const {queryByTestId} = render(<Component />);

    const imagePreview = queryByTestId('image-preview');
    expect(imagePreview).not.toBeInTheDocument();
  });

  it('render clip view when preview is allowed', () => {
    const {queryAllByTestId} = render(<Component />);
    const renderedItems = queryAllByTestId(/^clip-view/);

    expect(renderedItems.length).toEqual(imageFiles.length)
  });
});
