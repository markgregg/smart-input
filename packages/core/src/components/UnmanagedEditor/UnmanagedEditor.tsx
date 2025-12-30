import React, {
  ClipboardEvent,
  forwardRef,
  KeyboardEvent,
  memo,
  useCallback,
  useRef,
} from 'react';
import {
  useApi,
  useBehaviour,
  useCursorPosition,
  useDragHandlers,
  useKeyHandlers,
} from '@state/useState';
import { getPositionAndRect, getSelectionRange } from '../../utils/functions';
import { useElementObserver } from '../../hooks/useElementObserver';
import styles from './UnmanagedEditor.module.less';

/**
 * Props for the UnmanagedEditor component.
 */
interface UnmanagedEditorProps {
  /** Callback invoked when the editor content changes */
  onChange: (isReturn?: boolean) => void;
  /** Callback invoked when undo is triggered (Ctrl/Cmd+Z) */
  onUndo: () => void;
  /** Whether to allow line breaks (default: false) */
  enableLineBreaks?: boolean;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Custom CSS class name to apply to the editor area */
  className?: string | undefined;
}

/**
 * UnmanagedEditor provides the low-level contentEditable interface.
 * This component handles keyboard events, cursor tracking, and user interactions.
 * It's typically used internally by the Editor component rather than directly.
 *
 * @component
 * @internal
 */
export const UnmanagedEditor = memo(
  forwardRef<HTMLPreElement, UnmanagedEditorProps>((props, ref) => {
    const {
      onChange,
      onUndo,
      enableLineBreaks = false,
      placeholder = 'Start typing',
      className,
    } = props;
    const keyHandlers = useKeyHandlers((s) => s.keyHandlers);
    const { dragOverHandlers, dragLeaveHandlers, dropHandlers } =
      useDragHandlers((s) => s);
    const preRef = useRef<HTMLPreElement | null>(null);
    const { updatePosition } = useCursorPosition((s) => s);
    const { setElement } = useApi((s) => s);
    const selectionInProgress = useBehaviour((s) => s.selectionInProgress);

    const setRef = useCallback(
      (element: HTMLPreElement | null) => {
        if (!ref) return;
        if (typeof ref === 'function') {
          ref(element);
        } else {
          // Type assertion to allow assignment to current
          (ref as React.MutableRefObject<HTMLPreElement | null>).current =
            element;
        }
        preRef.current = element;
        setElement(preRef.current);
      },
      [ref, setElement],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLPreElement>) => {
        if (keyHandlers.length > 0) {
          for (const handler of keyHandlers) {
            if (handler({ ...event })) {
              event.preventDefault();
              event.stopPropagation();
              break;
            }
          }
        }
        if (
          event.key === 'Enter' &&
          (selectionInProgress || !enableLineBreaks)
        ) {
          event.preventDefault();
          return;
        }
        if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
          onUndo();
          event.preventDefault();
          return;
        }
      },
      [onUndo, selectionInProgress, enableLineBreaks, keyHandlers],
    );

    const updateCursorPosition = useCallback(() => {
      if (!preRef.current) return;
      const range = getSelectionRange(preRef.current);
      if (range) {
        const { characterPosition, rect } = getPositionAndRect(
          range,
          preRef.current,
        );
        updatePosition(characterPosition, rect);
      }
    }, [updatePosition]);

    // Monitor pre element for position and size changes
    useElementObserver(preRef.current, updateCursorPosition);

    const handleKeyUp = useCallback(
      (event: KeyboardEvent) => {
        if (
          event.key === 'Enter' &&
          (selectionInProgress || !enableLineBreaks)
        ) {
          event.preventDefault();
          return;
        }
        updateCursorPosition();
        onChange(event.key === 'Enter');
      },
      [updateCursorPosition, onChange, enableLineBreaks, selectionInProgress],
    );

    const handleChange = useCallback(() => {
      updateCursorPosition();
      onChange();
    }, [updateCursorPosition, onChange]);

    const handleCopy = useCallback((event: ClipboardEvent<HTMLPreElement>) => {
      const selection = document.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();
        const container = document.createElement('div');
        container.appendChild(fragment);
        const text = container.textContent ?? '';
        const html = container.innerHTML ?? '';
        event.clipboardData.setData('text/plain', text);
        event.clipboardData.setData('text/html', html);
        event.preventDefault();
      } else if (preRef.current) {
        const text = preRef.current.textContent ?? '';
        const html = preRef.current.innerHTML ?? text;
        event.clipboardData.setData('text/plain', text);
        event.clipboardData.setData('text/html', html);
        event.preventDefault();
      }
    }, []);

    const handlePaste = useCallback(
      (event: React.ClipboardEvent<HTMLPreElement>) => {
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        event.preventDefault();
      },
      [],
    );

    const handleDragOver = useCallback(
      (event: React.DragEvent<HTMLPreElement>) => {
        for (let index = 0; index < dragOverHandlers.length; index++) {
          const handler = dragOverHandlers[index];
          if (handler && handler(event)) {
            event.preventDefault();
            break;
          }
        }
      },
      [dragOverHandlers],
    );

    const handleDragLeave = useCallback(
      (event: React.DragEvent<HTMLPreElement>) => {
        for (let index = 0; index < dragLeaveHandlers.length; index++) {
          const handler = dragLeaveHandlers[index];
          if (handler && handler(event)) {
            event.preventDefault();
            break;
          }
        }
      },
      [dragLeaveHandlers],
    );

    const handleDrop = useCallback(
      (event: React.DragEvent<HTMLPreElement>) => {
        for (let index = 0; index < dropHandlers.length; index++) {
          const handler = dropHandlers[index];
          if (handler && handler(event)) {
            event.preventDefault();
            break;
          }
        }
      },
      [dropHandlers],
    );

    return (
      <pre
        id="si-edit-element"
        className={`${styles['editor']} ${className ?? ''}`}
        contentEditable={true}
        role="textbox"
        tabIndex={0}
        aria-label={placeholder}
        aria-multiline={enableLineBreaks}
        ref={setRef}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseUp={updateCursorPosition}
        onClick={updateCursorPosition}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-placeholder={placeholder}
      />
    );
  }),
);

UnmanagedEditor.displayName = 'UnmanagedEditor';
