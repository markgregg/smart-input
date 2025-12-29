import { describe, it, expect } from 'vitest';
import {
  CLIPBOARD_FORMAT,
  DELIMITERS,
  KeyBoardkeys,
  COMPACT_HEIGHT,
  NORMAL_HEIGHT,
  LARGE_HEIGHT,
} from './constants';

describe('Utils - Constants', () => {
  it('should have correct clipboard format', () => {
    expect(CLIPBOARD_FORMAT).toBe('text/json');
  });

  it('should have correct delimiters', () => {
    expect(DELIMITERS).toEqual([',', '\t', '\n']);
    expect(DELIMITERS).toHaveLength(3);
  });

  it('should have correct height constants', () => {
    expect(COMPACT_HEIGHT).toBe(24);
    expect(NORMAL_HEIGHT).toBe(30);
    expect(LARGE_HEIGHT).toBe(36);
  });

  it('should have all keyboard keys defined', () => {
    expect(KeyBoardkeys.ArrowUp).toBe('ArrowUp');
    expect(KeyBoardkeys.ArrowDown).toBe('ArrowDown');
    expect(KeyBoardkeys.ArrowLeft).toBe('ArrowLeft');
    expect(KeyBoardkeys.ArrowRight).toBe('ArrowRight');
    expect(KeyBoardkeys.Enter).toBe('Enter');
    expect(KeyBoardkeys.Tab).toBe('Tab');
    expect(KeyBoardkeys.Escape).toBe('Escape');
    expect(KeyBoardkeys.Space).toBe(' ');
  });

  it('should have copy/paste keys', () => {
    expect(KeyBoardkeys.c).toBe('c');
    expect(KeyBoardkeys.C).toBe('C');
    expect(KeyBoardkeys.v).toBe('v');
    expect(KeyBoardkeys.V).toBe('V');
    expect(KeyBoardkeys.x).toBe('x');
    expect(KeyBoardkeys.X).toBe('X');
  });

  it('should have undo/redo keys', () => {
    expect(KeyBoardkeys.z).toBe('z');
    expect(KeyBoardkeys.Z).toBe('Z');
  });
});
