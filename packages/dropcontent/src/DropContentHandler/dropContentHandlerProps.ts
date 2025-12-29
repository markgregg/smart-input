import { Editor } from '@smart-input/core';
import { ReactElement } from 'react';

/**
 * Props for the DropContentHandler component.
 */
export interface DropContentHandlerProps {
  /** The Editor component to wrap with drag-and-drop functionality */
  children: ReactElement<typeof Editor>;
  /**
   * Array of accepted MIME types and file extensions (default: ['image/*', 'application/pdf', '.doc', '.docx', '.txt'])
   * Examples: 'image/*', 'application/pdf', '.doc'
   */
  acceptedTypes?: string[];
  /** Callback invoked when files are successfully dropped */
  onDropSuccess?: (files: File[]) => void;
  /** Callback invoked when a drop operation fails */
  onDropError?: (error: string) => void;
  /** Whether to make the dropped content undeletable (default: false) */
  contentUndeletable?: boolean;
}
