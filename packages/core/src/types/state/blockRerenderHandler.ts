import { StyledBlockElement } from '@src/types/editorProps';

export interface BlockRerenderHandlerState {
  blockRerenderHandlers: Array<(blocks: StyledBlockElement[]) => void>;
  addBlockRerenderHandlers: (
    handler: (blocks: StyledBlockElement[]) => void,
  ) => void;
  removeBlockRerenderHandlers: (
    handler: (blocks: StyledBlockElement[]) => void,
  ) => void;
}
