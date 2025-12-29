import { describe, it, expect } from 'vitest';
import { BlockType } from './block';

describe('Core Package - Constants', () => {
  it('should export BlockType enum', () => {
    expect(BlockType.Text).toBeDefined();
    expect(BlockType.Styled).toBeDefined();
    expect(BlockType.Image).toBeDefined();
    expect(BlockType.Document).toBeDefined();
  });
});
