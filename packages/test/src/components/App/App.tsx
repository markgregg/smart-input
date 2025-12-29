import React from 'react';
import {
  SmartInput,
  Editor,
  Block,
  Rect,
  CommitItem,
  SmartInputApi,
} from '@smart-input/core';
import { CommitNotifier } from '@smart-input/commitnotifier';
import { TypeaheadLookup } from '@smart-input/typeahead';
import { DropContentHandler } from '@smart-input/dropcontent';
import { ReactBlocksDemo } from '../ReactBlocksDemo';
import { TestProps } from '../../props';
import { DragBlocksHandler } from '@smart-input/dragblocks';
import styles from './App.module.less';

interface AppProps {
  testProps?: TestProps;
}

export const App = ({ testProps }: AppProps) => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [eventsFired, setEventsFired] = React.useState<string[]>([]);
  const [lastEventTarget, setLastEventTarget] = React.useState<string>('');
  const apiRef = React.useRef<SmartInputApi>(null);

  const enableMouseEvents = testProps?.enableMouseEvents ?? false;

  const handleBlocksChange = (
    blocks: Block[],
    _characterPosition: number,
    _cursorRect: Rect,
  ) => {
    setBlocks(blocks);
  };

  const handleCommit = (items: CommitItem[]) => {
    console.warn('Committed items:', items);
    // Expose commit data to window for testing
    interface TestWindow extends Window {
      commitData?: unknown[];
    }
    const testWindow = window as TestWindow;
    if (!testWindow.commitData) {
      testWindow.commitData = [];
    }
    testWindow.commitData.push(items);
    return true;
  };

  const commitHandler = testProps?.c?.onCommit || handleCommit;

  // Event handlers for styled blocks
  const handleClick = (_block: Block, event: MouseEvent) => {
    console.warn('handleClick called, enableMouseEvents:', enableMouseEvents);
    if (!enableMouseEvents) return;
    setEventsFired((prev) => [...prev, 'click']);
    setLastEventTarget(
      (event.target as HTMLElement).id ||
        (event.target as HTMLElement).parentElement?.id ||
        '',
    );
  };

  const handleMouseEnter = (_block: Block, _event: MouseEvent) => {
    if (!enableMouseEvents) return;
    setEventsFired((prev) => [...prev, 'mouseenter']);
  };

  const handleMouseLeave = (_block: Block, _event: MouseEvent) => {
    if (!enableMouseEvents) return;
    setEventsFired((prev) => [...prev, 'mouseleave']);
  };

  const handleMouseDown = (_block: Block, _event: MouseEvent) => {
    if (!enableMouseEvents) return;
    setEventsFired((prev) => [...prev, 'mousedown']);
  };

  const handleMouseUp = (_block: Block, _event: MouseEvent) => {
    if (!enableMouseEvents) return;
    setEventsFired((prev) => [...prev, 'mouseup']);
  };

  const handleMouseMove = (_block: Block, _event: MouseEvent) => {
    if (!enableMouseEvents) return;
    setEventsFired((prev) => [...prev, 'mousemove']);
  };

  const handleMouseOver = (_block: Block, _event: MouseEvent) => {
    if (!enableMouseEvents) return;
    setEventsFired((prev) => [...prev, 'mouseover']);
  };

  // Expose API to window for testing
  React.useEffect(() => {
    interface TestWindow extends Window {
      testApi?: typeof apiRef.current;
      resetEvents?: () => void;
      testEnableMouseEvents?: boolean;
    }
    const testWindow = window as TestWindow;

    if (apiRef.current) {
      testWindow.testApi = apiRef.current;
    }
    // Allow tests to reset event tracking
    testWindow.resetEvents = () => {
      setEventsFired([]);
      setLastEventTarget('');
    };
    // Expose enableMouseEvents for debugging
    testWindow.testEnableMouseEvents = enableMouseEvents;
    console.warn(
      'App initialized with enableMouseEvents:',
      enableMouseEvents,
      'testProps:',
      testProps,
    );
  }, [enableMouseEvents, testProps]);

  const editorProps = {
    ...testProps?.e,
    onBlockClick: handleClick,
    onBlockMouseEnter: handleMouseEnter,
    onBlockMouseLeave: handleMouseLeave,
    onBlockMouseDown: handleMouseDown,
    onBlockMouseUp: handleMouseUp,
    onBlockMouseOver: handleMouseOver,
    onBlockMouseMove: handleMouseMove,
  };

  return (
    <div className={styles['app']}>
      {/* Hidden elements for test assertions */}
      <div
        id="test-events-fired"
        data-events={eventsFired.join(',')}
        style={{ display: 'none' }}
      >
        {eventsFired.join(',')}
      </div>
      <div
        id="test-event-target"
        data-target={lastEventTarget}
        style={{ display: 'none' }}
      >
        {lastEventTarget}
      </div>
      <SmartInput
        ref={apiRef}
        blocks={blocks}
        onBlocksChange={handleBlocksChange}
      >
        <DropContentHandler>
          <DragBlocksHandler>
            <Editor {...editorProps} />
          </DragBlocksHandler>
        </DropContentHandler>
        {
          <CommitNotifier
            onCommit={commitHandler}
            {...testProps?.c}
            enableHistory
            storeDocsAndImagesToHistory
          />
        }
        <TypeaheadLookup
          {...testProps?.t}
          lookups={
            testProps?.t?.lookups ?? [
              {
                category: 'test',
                items: [
                  'test',
                  'fred',
                  'fennel',
                  'patches',
                  'tes for',
                  'testing',
                  'testtube',
                  'testy',
                  'testo',
                ],
                style: { fontWeight: 'bold', color: 'blue' },
              },
            ]
          }
          wordsToCheck={testProps?.t?.wordsToCheck ?? 3}
          highlightMatch={testProps?.t?.highlightMatch ?? true}
          position={testProps?.t?.position ?? 'above'}
          autoInsert={testProps?.t?.autoInsert ?? true}
        />
        <ReactBlocksDemo />
      </SmartInput>
    </div>
  );
};
