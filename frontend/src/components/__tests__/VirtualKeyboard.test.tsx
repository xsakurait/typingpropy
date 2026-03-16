import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import VirtualKeyboard from '../VirtualKeyboard';
import React from 'react';

describe('VirtualKeyboard Smoke Test', () => {
  it('renders without crashing', () => {
    const { container } = render(<VirtualKeyboard nextKey="a" />);
    expect(container).toBeDefined();
  });

  it('highlights the correct key', () => {
    const { container } = render(<VirtualKeyboard nextKey="a" />);
    const highlighted = container.querySelector('.key.highlighted');
    expect(highlighted?.textContent).toContain('A');
  });
});
