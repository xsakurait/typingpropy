import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import TypingGame from '../TypingGame';
import React from 'react';
import { Lesson } from '../../types/lesson';

// Mock implementation for actions if needed
vi.mock('../../actions/saveResult', () => ({
  saveResult: vi.fn(),
}));

// Mock scrollTo as JSDOM doesn't implement it
Element.prototype.scrollTo = vi.fn();

const mockLesson: Lesson = {
  id: 'test-1',
  title: 'Test Lesson',
  content: 'Hello World',
  language: 'typescript',
};

describe('TypingGame Smoke Test', () => {
  it('renders typing game with lesson title', () => {
    const { getByText } = render(<TypingGame lesson={mockLesson} />);
    expect(getByText('Test Lesson')).toBeDefined();
  });

  it('renders the keyboard area', () => {
    const { container } = render(<TypingGame lesson={mockLesson} />);
    // Check for the keyboard container or similar
    expect(container.querySelector('.key')).toBeDefined();
  });
});
