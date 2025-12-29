import { Block } from '@smart-input/core';

/**
 * Represents a block stored in history with optional binary data.
 * Used for persisting blocks with documents/images to localStorage.
 */
export type HistoricBlock = {
  /** The block data */
  block: Block;
  /** Base64 encoded blob data for localStorage persistence of files/images */
  blobData?: string; // Base64 encoded blob data for localStorage persistence
  /** MIME content type of the blob data */
  contentType?: string;
};
