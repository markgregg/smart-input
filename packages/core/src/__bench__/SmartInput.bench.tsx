import { bench, describe } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { SmartInput } from '../components/SmartInput';
import { Editor } from '../components/Editor';
import { BlockType, type Block } from '../types/block';

/**
 * Performance benchmarks for SmartInput component
 *
 * These benchmarks measure rendering performance with various content sizes
 * to ensure the editor remains performant as content grows.
 */

describe('SmartInput Performance Benchmarks', () => {
  const createTextBlock = (text: string): Block => ({
    type: BlockType.Text,
    text,
  });

  bench('render empty editor', () => {
    render(
      <SmartInput>
        <Editor />
      </SmartInput>,
    );
    cleanup();
  });

  bench('render editor with small content (100 chars)', () => {
    const content = 'Hello world! '.repeat(8); // ~100 characters
    const blocks = [createTextBlock(content)];
    render(
      <SmartInput blocks={blocks}>
        <Editor />
      </SmartInput>,
    );
    cleanup();
  });

  bench('render editor with medium content (1000 chars)', () => {
    const content = 'Hello world! This is a test. '.repeat(35); // ~1000 characters
    const blocks = [createTextBlock(content)];
    render(
      <SmartInput blocks={blocks}>
        <Editor />
      </SmartInput>,
    );
    cleanup();
  });

  bench('render editor with large content (10000 chars)', () => {
    const content = 'Hello world! This is a test. '.repeat(350); // ~10000 characters
    const blocks = [createTextBlock(content)];
    render(
      <SmartInput blocks={blocks}>
        <Editor />
      </SmartInput>,
    );
    cleanup();
  });

  bench('render editor with multiple blocks', () => {
    const blocks = Array.from({ length: 10 }, (_, i) =>
      createTextBlock(`Block ${i + 1} content`),
    );
    render(
      <SmartInput blocks={blocks}>
        <Editor />
      </SmartInput>,
    );
    cleanup();
  });

  bench('re-render with same content', () => {
    const blocks = [createTextBlock('Hello world')];
    const { rerender } = render(
      <SmartInput blocks={blocks}>
        <Editor />
      </SmartInput>,
    );
    rerender(
      <SmartInput blocks={blocks}>
        <Editor />
      </SmartInput>,
    );
    cleanup();
  });

  bench('re-render with changed content', () => {
    const blocks1 = [createTextBlock('Hello world')];
    const blocks2 = [createTextBlock('Hello world updated')];
    const { rerender } = render(
      <SmartInput blocks={blocks1}>
        <Editor />
      </SmartInput>,
    );
    rerender(
      <SmartInput blocks={blocks2}>
        <Editor />
      </SmartInput>,
    );
    cleanup();
  });
});
