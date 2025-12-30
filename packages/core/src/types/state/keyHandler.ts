import { KeyCombination } from '../editorProps';

export interface KeyHandlerState {
  /* return true to stop the event default and bubbling */
  keyHandlers: Array<(keys: KeyCombination) => boolean>;
  addKeyboardHandler: (handler: (keys: KeyCombination) => boolean) => void;
  removeKeyboardHandler: (handler: (keys: KeyCombination) => boolean) => void;
}
