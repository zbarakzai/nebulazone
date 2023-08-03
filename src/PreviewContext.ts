import { createContext, useContext } from "react";

import type { PreviewProps } from "./components/Preview";

export type PreviewContextType = PreviewProps & {
  /** The height of the image */
  imageHeight: number;
  /** The width of the image */
  imageWidth: number;
  /** The image container height */
  viewHeight: number;
};

export const PreviewContext = createContext<PreviewContextType>(null);

export const usePreviewContext = () => {
  const currentPreviewContext = useContext(PreviewContext);

  if (!currentPreviewContext) {
    throw new Error(
      "usePrivewContext has to be used within <PreviewContext.Provider>"
    );
  }

  return currentPreviewContext;
};
