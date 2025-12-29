import React, { forwardRef, PropsWithChildren } from 'react';
import { StateProvider } from '@state/StateProvider';
import { ComponentProps } from '@atypes/componentProps';
import { Api } from '../Api';
import { SmartInputApi } from '@src/types/api';
import cx from 'classnames';
import style from './SmartInput.module.less';

/**
 * SmartInput is the main container component for the rich text editor.
 * It provides state management and API access to all child components.
 * Use this component as the root wrapper for Editor and other editor-related components.
 *
 * @component
 * @example
 * ```tsx
 * const apiRef = useRef<SmartInputApi>(null);
 *
 * <SmartInput ref={apiRef} blocks={initialBlocks} onBlocksChange={handleChange}>
 *   <Editor enableLineBreaks={true} />
 *   <CommitNotifier onCommit={handleCommit} />
 * </SmartInput>
 * ```
 */
export const SmartInput = forwardRef<
  SmartInputApi,
  PropsWithChildren<ComponentProps>
>(function SmartInput({ children, className, id, ...props }, ref) {
  return (
    <StateProvider value={props}>
      <Api ref={ref} />
      <div id={id} className={cx(style['SmartInput'], className)}>
        {children}
      </div>
    </StateProvider>
  );
});

SmartInput.displayName = 'SmartInput';
