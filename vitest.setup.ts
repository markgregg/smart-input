import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock CSS and LESS imports
vi.mock('*.css', () => ({}));
vi.mock('*.less', () => ({}));
