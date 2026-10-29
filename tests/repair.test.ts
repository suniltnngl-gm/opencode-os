import { repair } from '../cli/repair';
import { describe, it, expect } from 'vitest';

describe('cli/repair', () => {
  it('executes without throwing', () => {
    expect(() => repair()).not.toThrow();
  });
});
