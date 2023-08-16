import {ByteUnits} from './components/DropZone';
import {createContext, useContext} from 'react';

export interface DropZoneContextType {
  /** Allowed file types */
  accept?: string;
  /** The file type */
  type?: string;
  /** Whether accept multiple file.  */
  allowMultiple?: boolean;
  /** The maximum allowed file size in bytes. */
  maxFileSize?: `${number}${ByteUnits}`;
  /** The layout style for the panel. */
  panelLayout?: 'integrated' | 'compact' | 'circle';
  /** The minimum allowed file size in bytes. */
  minFileSize?: `${number}${ByteUnits}`;
  /** The maximum allowed total file size in bytes. */
  maxTotalFileSize?: `${number}${ByteUnits}`;
  /** Enables the disabled state. */
  disabled?: boolean;
  /** Root node containing drop zone and items */
  rootNode: React.RefObject<HTMLDivElement>;
}

export const DropZoneContext = createContext<DropZoneContextType | null>(null);

export const useDropZoneContext = () => {
  const currentDropZoneContext = useContext(DropZoneContext);

  if (!currentDropZoneContext) {
    throw new Error(
      'useDropZoneContext has to be used within <DropZoneContext.Provider>',
    );
  }

  return currentDropZoneContext;
};
