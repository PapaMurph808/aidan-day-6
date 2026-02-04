# Research & Technology Decisions: Overdue Todo Items

**Feature**: 001-overdue-todos  
**Date**: 2026-02-04  
**Related**: [plan.md](plan.md), [spec.md](spec.md)

## Overview

This document captures technology decisions and research findings for implementing overdue todo indicators. All decisions prioritize simplicity, existing patterns, and constitution compliance (KISS, DRY, test-first development).

## Decision 1: Date Comparison Location (Client vs. Server)

### Decision: Client-Side Calculation

**Rationale**:
- No new database fields required (derived from existing `dueDate`)
- Consistent with spec requirement: "overdue indicator is derived from comparing due date to current date"
- Simpler implementation - no backend changes needed
- Immediate updates when user edits due dates (no API round-trip)
- Aligns with existing architecture: backend provides data, frontend handles presentation

**Alternatives Considered**:

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| Server-side | Single source of truth, consistent timezone | Requires DB schema change, API modification, slower updates | Violates simplicity principle, unnecessary complexity for presentation feature |
| Hybrid (server calculates, client caches) | Best of both worlds | Most complex, introduces caching logic | Over-engineering for simple derived property |

**Implementation Notes**:
- Create `src/utils/dateUtils.js` with `isOverdue(dueDate, completed)` function
- Use JavaScript Date objects for comparison
- Strip time components (compare dates only: YYYY-MM-DD)
- Function accepts ISO date string and completed boolean, returns boolean

**Testing Strategy**:
- Mock `Date.now()` in tests for deterministic results
- Test edge cases: today's date, past dates, future dates, null dates, completed items
- Verify timezone-agnostic behavior (date-only comparison)

## Decision 2: React Rendering Optimization

### Decision: useMemo for Sorting, No Component Memoization

**Rationale**:
- `useMemo` prevents expensive sorting recalculation on every render
- Component memoization (`React.memo`) adds complexity without proven benefit
- Current todo list size (10-50 items typical, 500 max) doesn't justify premature optimization
- Aligns with constitution principle: "No premature optimization"
- If performance issues arise later, add `React.memo` incrementally

**Alternatives Considered**:

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| No optimization | Simplest | Re-sorts on every render | Unnecessary computation, violates performance target (SC-005) |
| Full memoization (useMemo + React.memo) | Maximum performance | Adds complexity, harder to debug | Premature optimization, current list sizes don't warrant |
| Virtual scrolling (react-window) | Handles huge lists | Major dependency, complex setup | Overkill for 500 item max, violates KISS |

**Implementation Notes**:
```javascript
// In TodoList.js
const sortedTodos = useMemo(() => {
  const overdue = todos
    .filter(t => isOverdue(t.dueDate, t.completed))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  const others = todos
    .filter(t => !isOverdue(t.dueDate, t.completed))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return [...overdue, ...others];
}, [todos]);
```

**Performance Validation**:
- Test with 500 todos using React DevTools Profiler
- Measure render time < 100ms (SC-005 requirement)
- If performance issues found, add React.memo to TodoCard as next step

## Decision 3: Visual Design Implementation

### Decision: Red Color (#c62828/#ef5350) + Warning Icon (⚠️)

**Rationale**:
- Clarification from spec: "Combination - Use both color AND icon for maximum visibility"
- Red universally indicates urgency/warning (strong cultural association)
- Aligns with existing UI guidelines: danger color defined as #c62828 (light mode) / #ef5350 (dark mode)
- Halloween theme compatible: red as accent color for urgency
- ⚠️ (U+26A0) is standard warning symbol, supported across all modern browsers
- Meets WCAG AA contrast requirements when combined with existing text colors

**Alternatives Considered**:

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| Color only | Simpler implementation | Fails for colorblind users, less accessible | Spec mandates color + icon |
| Icon only | Accessible | Less immediate visual impact | Spec mandates color + icon |
| Custom SVG icon | More design control | Adds asset management complexity | Unicode emoji is simpler, widely supported |
| 🔥 (fire emoji) | Playful, fits Halloween theme | Less universal than warning symbol | ⚠️ is more professional, clearer meaning |

**Implementation Notes**:
```css
/* App.css */
.todo-card.overdue {
  border-left: 4px solid var(--danger-color);
  background-color: rgba(239, 83, 80, 0.05); /* Light red tint */
}

.todo-card.overdue .todo-title {
  color: var(--danger-color);
}

.overdue-icon {
  color: var(--danger-color);
  margin-right: 8px;
  font-size: 20px;
}
```

**Accessibility Validation**:
- Verify contrast ratio ≥ 4.5:1 (WCAG AA)
- Test with screen readers (ARIA labels if needed)
- Ensure icon + color provides redundant cues (don't rely solely on color)

## Decision 4: Date Testing Strategy

### Decision: Jest Mock Date with date-fns-style Approach

**Rationale**:
- Jest provides built-in date mocking: `jest.useFakeTimers()` and `jest.setSystemTime()`
- Deterministic test results regardless of when tests run
- No new dependencies required (native Jest functionality)
- Allows testing edge cases: midnight transitions, boundary conditions
- Consistent with existing Jest testing infrastructure

**Alternatives Considered**:

| Approach | Pros | Cons | Rejected Because |
|----------|------|------|------------------|
| date-fns library | Rich date utilities, well-tested | New dependency, overkill for simple comparison | Violates KISS, no need for date manipulation |
| moment.js | Comprehensive | Large bundle, deprecated | Outdated, excessive for date-only comparison |
| Real dates in tests | No mocking complexity | Non-deterministic, fragile tests | Tests may fail depending on execution date/time |

**Implementation Notes**:
```javascript
// dateUtils.test.js
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-02-04T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

test('identifies overdue todo', () => {
  const dueDate = '2026-02-03'; // Yesterday
  const result = isOverdue(dueDate, false);
  expect(result).toBe(true);
});
```

**Testing Coverage**:
- Today's date edge case
- Past dates (various degrees of overdue)
- Future dates
- Null/undefined dates
- Completed vs incomplete items
- Date string format variations

## Decision 5: Component Responsibilities (Single Responsibility Principle)

### Decision: Separate Concerns Across dateUtils, TodoCard, TodoList

**Rationale**:
- **dateUtils**: Pure date comparison logic (testable in isolation)
- **TodoCard**: Visual rendering based on isOverdue result
- **TodoList**: Sorting and aggregation (badge count)
- Follows SOLID principles: each module has one reason to change
- Easier to test (unit tests for utilities, component tests for UI)
- Promotes code reuse (dateUtils can be used anywhere in app)

**Module Responsibilities**:

```
dateUtils.js
├── isOverdue(dueDate, completed) → boolean
│   └── Pure function, no side effects
│   └── Handles edge cases (null dates, invalid formats)
└── Tests: All date logic edge cases

TodoCard.js
├── Receives todo object
├── Calls isOverdue() to determine styling
├── Applies .overdue CSS class conditionally
└── Tests: Visual rendering based on isOverdue result

TodoList.js
├── Sorts todos using isOverdue() results
├── Calculates overdue count for badge
├── Renders sorted TodoCard components
└── Tests: Sorting logic, badge display, count accuracy
```

**Benefits**:
- DRY: Date logic centralized in one place
- Testability: Each module tested independently
- Maintainability: Changes to date logic don't affect components
- Reusability: dateUtils can be used in other features (e.g., future date range filters)

## Technology Stack Summary

**No New Dependencies Required**:
- Existing: React 18.2, Jest, React Testing Library
- New modules: dateUtils.js (custom utility, no external deps)

**Development Tools**:
- Jest fake timers for date mocking
- React DevTools Profiler for performance validation
- Browser DevTools for CSS debugging

**Browser Support**:
- Target: Chrome, Firefox, Safari (latest versions)
- Warning symbol (⚠️): Supported in all modern browsers
- Date parsing: Use ISO 8601 format (YYYY-MM-DD) for consistency

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Timezone confusion | Low | Medium | Use date-only comparison, strip time components |
| Date parsing inconsistencies | Low | Low | Enforce ISO 8601 format, test across browsers |
| Performance with large lists | Low | Medium | useMemo optimization, performance tests with 500 items |
| Accessibility issues | Medium | High | Test with screen readers, verify WCAG AA compliance |
| Color-only reliance | Low | High | Use color + icon combo as specified |

## Implementation Checklist

- [ ] Create dateUtils.js with isOverdue() function
- [ ] Write comprehensive dateUtils tests (all edge cases)
- [ ] Add overdue styling to App.css (color + icon)
- [ ] Modify TodoCard to apply overdue class conditionally
- [ ] Write TodoCard overdue rendering tests
- [ ] Modify TodoList with useMemo sorting logic
- [ ] Add badge component to TodoList
- [ ] Write TodoList sorting and badge tests
- [ ] Performance test with 500 todos
- [ ] Accessibility audit (contrast, screen readers)
- [ ] Cross-browser testing

## References

- Constitution: `.specify/memory/constitution.md`
- UI Guidelines: `/docs/ui-guidelines.md`
- Coding Standards: `/docs/coding-guidelines.md`
- Spec: [spec.md](spec.md)
- Plan: [plan.md](plan.md)
