import { describe, it, expect } from 'vitest';
import { KEY_MAP } from '../keyboard';

describe('Keyboard Mapping', () => {
  it('should map "a" to left pinky', () => {
    expect(KEY_MAP['a'].finger).toBe('left-pinky');
    expect(KEY_MAP['a'].hand).toBe('left');
  });

  it('should map "f" to left index', () => {
    expect(KEY_MAP['f'].finger).toBe('left-index');
    expect(KEY_MAP['f'].hand).toBe('left');
  });

  it('should map "j" to right index', () => {
    expect(KEY_MAP['j'].finger).toBe('right-index');
    expect(KEY_MAP['j'].hand).toBe('right');
  });

  it('should map space to right thumb', () => {
    expect(KEY_MAP[' '].finger).toBe('right-thumb');
    expect(KEY_MAP[' '].hand).toBe('right');
  });

  it('should have consistent mappings for uppercase and lowercase', () => {
    const keys = ['a', 'b', 'c', 'q', 'w', 'e'];
    keys.forEach(k => {
      expect(KEY_MAP[k.toLowerCase()]).toEqual(KEY_MAP[k.toUpperCase()]);
    });
  });
});
