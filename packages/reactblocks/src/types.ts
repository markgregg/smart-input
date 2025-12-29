import { ReactNode } from 'react';

/**
 * Configuration for a React component to be rendered in a styled block
 */
export interface ReactBlockComponent {
  /** The styled block this component is associated with */
  blockId: string;
  /** The React component to render */
  component: ReactNode;
}
