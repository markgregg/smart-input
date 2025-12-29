/**
 * A single lookup result item to display in the typeahead dropdown.
 */
export type LookupResult = {
  /** The text content of the result */
  text: string;
  /** Optional category for grouping results */
  category?: string;
  /** Match quality score (0 = perfect match, higher = worse match) */
  score: number; // 0 = perfect match, larger = worse
  /** The portion of text that was matched in the search */
  matchedText: string;
};

/**
 * A match result returned from a lookup function.
 */
export type LookupMatch = {
  /** The matched text to display */
  text: string;
  /** Match quality score (0 = perfect match, higher = worse match) */
  score: number; // 0 = perfect match, larger = worse
};

/**
 * A function that performs asynchronous lookup based on the input text.
 * @param text - The search query text
 * @returns Promise resolving to an array of matches
 */
export type LookupFunction = (text: string) => Promise<LookupMatch[]>;

/**
 * A lookup provider that uses a custom function to fetch results.
 */
export type LookupFn = {
  /** Optional category name for this lookup */
  category?: string;
  /** The function to call for performing lookups */
  func: LookupFunction;
  /** Optional CSS styles to apply to items from this lookup */
  style?: React.CSSProperties;
};

/**
 * A lookup provider that uses a static list of items for matching.
 */
export type LookupList = {
  /** Optional category name for this lookup */
  category?: string;
  /** The list of items to search through */
  items: string[];
  /** Optional CSS styles to apply to items from this list */
  style?: React.CSSProperties;
};

/**
 * A lookup can be either a function-based or list-based provider.
 */
export type Lookup = LookupFn | LookupList;
