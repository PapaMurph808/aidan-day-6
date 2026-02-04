import { isOverdue } from '../dateUtils';

describe('isOverdue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Set current date to February 4, 2026
    jest.setSystemTime(new Date('2026-02-04T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('past dates', () => {
    test('returns true for past date with incomplete todo', () => {
      expect(isOverdue('2026-02-03', false)).toBe(true);
    });

    test('returns true for very old date with incomplete todo', () => {
      expect(isOverdue('2025-01-01', false)).toBe(true);
    });

    test('returns false for past date with completed todo', () => {
      expect(isOverdue('2026-02-03', true)).toBe(false);
    });
  });

  describe('current date', () => {
    test('returns false for today with incomplete todo', () => {
      expect(isOverdue('2026-02-04', false)).toBe(false);
    });

    test('returns false for today with completed todo', () => {
      expect(isOverdue('2026-02-04', true)).toBe(false);
    });
  });

  describe('future dates', () => {
    test('returns false for future date with incomplete todo', () => {
      expect(isOverdue('2026-02-05', false)).toBe(false);
    });

    test('returns false for far future date with incomplete todo', () => {
      expect(isOverdue('2027-12-31', false)).toBe(false);
    });

    test('returns false for future date with completed todo', () => {
      expect(isOverdue('2026-02-05', true)).toBe(false);
    });
  });

  describe('null/undefined dates', () => {
    test('returns false for null date with incomplete todo', () => {
      expect(isOverdue(null, false)).toBe(false);
    });

    test('returns false for undefined date with incomplete todo', () => {
      expect(isOverdue(undefined, false)).toBe(false);
    });

    test('returns false for null date with completed todo', () => {
      expect(isOverdue(null, true)).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('returns false for empty string date', () => {
      expect(isOverdue('', false)).toBe(false);
    });

    test('returns false for invalid date string', () => {
      expect(isOverdue('invalid-date', false)).toBe(false);
    });

    test('handles ISO 8601 date with time component (should ignore time)', () => {
      expect(isOverdue('2026-02-03T23:59:59Z', false)).toBe(true);
    });

    test('handles completed status coercion (truthy value)', () => {
      expect(isOverdue('2026-02-03', 1)).toBe(false);
    });

    test('handles completed status coercion (falsy value)', () => {
      expect(isOverdue('2026-02-03', 0)).toBe(true);
    });
  });

  describe('time component handling', () => {
    test('treats dates as date-only, ignoring time at end of day', () => {
      expect(isOverdue('2026-02-04T23:59:59Z', false)).toBe(false);
    });

    test('treats dates as date-only, ignoring time at start of day', () => {
      expect(isOverdue('2026-02-04T00:00:00Z', false)).toBe(false);
    });

    test('treats past date as overdue regardless of time', () => {
      expect(isOverdue('2026-02-03T23:59:59Z', false)).toBe(true);
    });
  });
});
