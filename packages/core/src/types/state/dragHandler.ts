// Placeholder for behaviour state types

import { DragEventType } from '../editorProps';

export interface DragHandlerState {
  dragOverHandlers: Array<(event: React.DragEvent<HTMLPreElement>) => boolean>;
  dragLeaveHandlers: Array<(event: React.DragEvent<HTMLPreElement>) => boolean>;
  dropHandlers: Array<(event: React.DragEvent<HTMLPreElement>) => boolean>;
  addDragHandler: (
    eventType: DragEventType,
    handler: (event: React.DragEvent<HTMLPreElement>) => boolean,
  ) => void;
  removeDragHandler: (
    eventType: DragEventType,
    handler: (event: React.DragEvent<HTMLPreElement>) => boolean,
  ) => void;
}
