import { bench, describe } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { SmartInput, Editor } from '@src';
import { TypeaheadLookup } from '../TypeaheadLookup/TypeaheadLookup';
import type { Lookup } from '../TypeaheadLookup/typeAheadLookupProps';

/**
 * Performance benchmarks for TypeaheadLookup component
 */

describe('TypeaheadLookup Performance Benchmarks', () => {
  const createMockLookup = (itemCount: number): Lookup => ({
    category: 'Test',
    func: async (query: string) => {
      return Array.from({ length: itemCount }, (_, i) => ({
        text: `Item ${i}: ${query}`,
        score: Math.random(),
      }));
    },
  });

  bench('render with single lookup (10 items)', () => {
    const lookups = [createMockLookup(10)];
    render(
      <SmartInput>
        <Editor />
        <TypeaheadLookup lookups={lookups} />
      </SmartInput>,
    );
    cleanup();
  });

  bench('render with single lookup (50 items)', () => {
    const lookups = [createMockLookup(50)];
    render(
      <SmartInput>
        <Editor />
        <TypeaheadLookup lookups={lookups} />
      </SmartInput>,
    );
    cleanup();
  });

  bench('render with single lookup (100 items)', () => {
    const lookups = [createMockLookup(100)];
    render(
      <SmartInput>
        <Editor />
        <TypeaheadLookup lookups={lookups} />
      </SmartInput>,
    );
    cleanup();
  });

  bench('render with multiple lookups', () => {
    const lookups = [
      createMockLookup(20),
      createMockLookup(20),
      createMockLookup(20),
    ];
    render(
      <SmartInput>
        <Editor />
        <TypeaheadLookup lookups={lookups} />
      </SmartInput>,
    );
    cleanup();
  });

  bench('render with category display enabled', () => {
    const lookups = [createMockLookup(50)];
    render(
      <SmartInput>
        <Editor />
        <TypeaheadLookup lookups={lookups} showCategory={true} />
      </SmartInput>,
    );
    cleanup();
  });

  bench('render with auto-insert enabled', () => {
    const lookups = [createMockLookup(50)];
    render(
      <SmartInput>
        <Editor />
        <TypeaheadLookup lookups={lookups} autoInsert={true} />
      </SmartInput>,
    );
    cleanup();
  });
});
