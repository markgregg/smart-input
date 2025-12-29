import React from 'react';
import type { LookupResult } from '../utils/typeaheadLookup';
import cx from 'classnames';
import { removeMatchedText } from '@smart-input/core';
import styles from './TypeaheadItem.module.less';

type Props = {
  item: LookupResult;
  globalIndex: number;
  isHighlighted: boolean;
  onMouseEnter: (index: number) => void;
  onClick: (index: number) => void;
  showCategory?: boolean;
  showScore?: boolean;
  highlightMatch?: boolean;
  itemClassname?: string;
};

/* Forward ref so parent can keep item element refs for scrolling */
const TypeaheadItem = React.forwardRef<HTMLDivElement, Props>(
  function TypeaheadItem(
    {
      item,
      globalIndex,
      isHighlighted,
      onMouseEnter,
      onClick,
      showCategory,
      showScore,
      highlightMatch,
      itemClassname,
    },
    ref,
  ) {
    const itemClass = isHighlighted
      ? `${styles['typeaheadItem']} ${styles['highlighted']}`
      : styles['typeaheadItem'];

    return (
      <div
        ref={ref}
        onMouseEnter={() => onMouseEnter(globalIndex)}
        onClick={() => onClick(globalIndex)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(globalIndex);
          }
        }}
        className={cx(itemClass, itemClassname)}
        role="option"
        aria-selected={isHighlighted}
        tabIndex={-1}
      >
        {highlightMatch ? (
          <div>
            <span className={styles['matchedText']}>{item.matchedText}</span>
            <span className={styles['typeaheadText']}>
              {removeMatchedText(item.text, item.matchedText)}
            </span>
          </div>
        ) : (
          <div className={styles['typeaheadText']}>{item.text}</div>
        )}
        {showCategory && (
          <div className={styles['typeaheadCategory']}>
            {item.category ?? ''}
          </div>
        )}
        {showScore && (
          <div className={styles['typeaheadScore']}>{item.score}</div>
        )}
      </div>
    );
  },
);

TypeaheadItem.displayName = 'TypeaheadItem';

export default TypeaheadItem;
