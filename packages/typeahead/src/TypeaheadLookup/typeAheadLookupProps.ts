import { Lookup, LookupResult } from './utils/typeaheadLookup';

export type { Lookup, LookupResult };

/**
 * Position of the typeahead dropdown relative to the cursor.
 */
export type TypeaheadDropdownPosition = 'above' | 'below';

/**
 * Props for the TypeaheadLookup component.
 */
export type TypeaheadLookupProps = {
  /** Milliseconds to debounce calls to lookup functions (default: 200) */
  debounce?: number;

  /** When true, the first visible item is highlighted automatically */
  autoHighlight?: boolean;

  /** Array of async lookup functions that accept a query string and return results */
  lookups: Lookup[];

  /** Number of last words to extract from the cursor context to use as queries  */
  wordsToCheck?: number;

  /** Show the category on each lookup item */
  showCategory?: boolean;

  /** Show the score on each lookup item */
  showScore?: boolean;

  /** Minimum length required for the first (shortest) query word (default: 3) */
  minSearchLength?: number;

  /** Maximum height of the dropdown in pixels (default: 240) */
  maxHeight?: number;

  /** Maximum width of the dropdown in pixels (default: 380) */
  maxWidth?: number;

  /** Position of the dropdown list relative to the cursor (default: 'below') */
  position?: TypeaheadDropdownPosition;

  /**
   * When true, the component will automatically insert the selected item's text into blocks.
   * The selected text will be styled and can be modified/removed by the user.
   */
  autoInsert?: boolean;

  /** Highlight where the search text matches in the item */
  highlightMatch?: boolean;

  /** CSS class name to apply to dropdown items */
  itemClassname?: string;

  /** Called when user selects an item (Enter key or click) */
  onSelect?: (item: LookupResult, blockIndex: number, position: number) => void;
};
