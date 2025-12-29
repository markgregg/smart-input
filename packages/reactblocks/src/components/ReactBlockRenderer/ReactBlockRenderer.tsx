import React, { memo, ReactNode, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface ReactBlockRendererProps {
  /** The ID of the styled block to render the component in */
  blockId: string;
  /** The React component to render */
  component: ReactNode;
}

/**
 * Component that renders a React component into a styled block's DOM element using a Portal.
 * The target element is identified by a data attribute matching the block ID.
 *
 * @example
 * ```tsx
 * <ReactBlockRenderer
 *   blockId="user-123"
 *   component={<UserCard userId={123} />}
 * />
 * ```
 */
export const ReactBlockRenderer: React.FC<ReactBlockRendererProps> = memo(
  ({ blockId, component }) => {
    const targetElement = useMemo(
      () => document.getElementById(blockId),
      [blockId],
    );

    if (!targetElement) {
      console.warn(
        `ReactBlockRenderer: Target element with id "${blockId}" not found.`,
      );
      return null;
    }

    // Render the component into the target element using a portal
    return targetElement ? createPortal(component, targetElement) : null;
  },
);

ReactBlockRenderer.displayName = 'ReactBlockRenderer';
