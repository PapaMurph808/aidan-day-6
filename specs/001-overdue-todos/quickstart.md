# Quickstart Guide: Overdue Todo Items

**Feature**: 001-overdue-todos  
**Date**: 2026-02-04  
**Related**: [plan.md](plan.md), [spec.md](spec.md)

## Prerequisites

- Node.js v16+ installed
- npm v7+ installed
- Git installed
- Code editor (VS Code recommended)

## Initial Setup

### 1. Clone and Install (If Starting Fresh)

```bash
# Clone repository
git clone <repository-url>
cd aidan-day-6

# Install all dependencies
npm install

# Verify installation
npm test  # Should pass all existing tests
```

### 2. Checkout Feature Branch

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull origin main

# Create/checkout feature branch
git checkout -b 001-overdue-todos

# Or if branch already exists
git checkout 001-overdue-todos
```

### 3. Verify Development Environment

```bash
# Start both frontend and backend
npm start

# In separate terminal, run tests in watch mode
npm run test:frontend -- --watch
```

**Expected Results**:
- Backend running on http://localhost:3030
- Frontend running on http://localhost:3000
- Browser opens automatically to http://localhost:3000
- All existing tests passing

## Development Workflow

### Test-Driven Development (TDD)

This feature follows strict TDD workflow per constitution:

1. **Red**: Write failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Clean up while keeping tests green

### Phase 1: Date Utilities (P1 - Foundation)

#### Step 1: Create dateUtils Test File

```bash
# Create test file first
touch packages/frontend/src/utils/__tests__/dateUtils.test.js
```

**Write failing tests**:
```javascript
// packages/frontend/src/utils/__tests__/dateUtils.test.js
import { isOverdue } from '../dateUtils';

describe('isOverdue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-04T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns true for past incomplete todo', () => {
    expect(isOverdue('2026-02-03', false)).toBe(true);
  });

  test('returns false for today incomplete todo', () => {
    expect(isOverdue('2026-02-04', false)).toBe(false);
  });

  // Add remaining tests from spec...
});
```

#### Step 2: Run Test (Should Fail)

```bash
npm run test:frontend -- dateUtils
```

**Expected**: Test fails because dateUtils.js doesn't exist yet. ✅ RED

#### Step 3: Create dateUtils Implementation

```bash
# Create utils directory if it doesn't exist
mkdir -p packages/frontend/src/utils

# Create implementation file
touch packages/frontend/src/utils/dateUtils.js
```

**Write minimal implementation**:
```javascript
// packages/frontend/src/utils/dateUtils.js
export function isOverdue(dueDate, completed) {
  if (completed || !dueDate) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}
```

#### Step 4: Run Test Again (Should Pass)

```bash
npm run test:frontend -- dateUtils
```

**Expected**: All dateUtils tests pass. ✅ GREEN

### Phase 2: TodoCard Styling (P1 - Core Value)

#### Step 1: Add Overdue Tests to TodoCard

```javascript
// packages/frontend/src/components/__tests__/TodoCard.test.js
import { render, screen } from '@testing-library/react';
import TodoCard from '../TodoCard';

// Mock dateUtils
jest.mock('../../utils/dateUtils', () => ({
  isOverdue: jest.fn()
}));

import { isOverdue } from '../../utils/dateUtils';

describe('TodoCard overdue indicators', () => {
  test('displays overdue styling for overdue todo', () => {
    isOverdue.mockReturnValue(true);
    
    const todo = {
      id: 1,
      title: 'Overdue task',
      dueDate: '2026-02-03',
      completed: false,
      createdAt: '2026-02-01T00:00:00Z'
    };
    
    render(<TodoCard todo={todo} onToggle={() => {}} onDelete={() => {}} onUpdate={() => {}} />);
    
    const card = screen.getByText('Overdue task').closest('.todo-card');
    expect(card).toHaveClass('overdue');
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  // Add more tests...
});
```

#### Step 2: Run Test (Should Fail)

```bash
npm run test:frontend -- TodoCard
```

**Expected**: New overdue tests fail. ✅ RED

#### Step 3: Update TodoCard Component

```javascript
// packages/frontend/src/components/TodoCard.js
import { isOverdue } from '../utils/dateUtils';

function TodoCard({ todo, onToggle, onDelete, onUpdate }) {
  const isOverdueItem = isOverdue(todo.dueDate, todo.completed);
  
  return (
    <div className={`todo-card ${isOverdueItem ? 'overdue' : ''}`}>
      {isOverdueItem && <span className="overdue-icon" aria-label="Overdue">⚠️</span>}
      {/* ... rest of component ... */}
    </div>
  );
}
```

#### Step 4: Add CSS Styling

```css
/* packages/frontend/src/App.css */
.todo-card.overdue {
  border-left: 4px solid var(--danger-color, #c62828);
  background-color: rgba(239, 83, 80, 0.05);
}

.todo-card.overdue .todo-title {
  color: var(--danger-color, #c62828);
}

.overdue-icon {
  color: var(--danger-color, #c62828);
  margin-right: 8px;
  font-size: 20px;
  display: inline-flex;
  align-items: center;
}
```

#### Step 5: Run Tests (Should Pass)

```bash
npm run test:frontend -- TodoCard
```

**Expected**: All TodoCard tests pass. ✅ GREEN

### Phase 3: TodoList Sorting (P2 - Enhanced Discovery)

Follow same TDD pattern:
1. Write sorting tests in TodoList.test.js
2. Run tests (expect failure)
3. Implement sorting with useMemo
4. Run tests (expect success)

### Phase 4: TodoList Badge (P3 - Quick Awareness)

Follow same TDD pattern:
1. Write badge tests in TodoList.test.js
2. Run tests (expect failure)
3. Implement badge component
4. Run tests (expect success)

## Testing Commands

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run tests in watch mode
npm run test:frontend -- --watch

# Run specific test file
npm run test:frontend -- dateUtils

# Run tests with coverage
npm run test:frontend -- --coverage

# Run backend tests (no changes expected)
npm run test:backend
```

## Verification Checklist

After completing implementation:

### Functionality
- [ ] Overdue incomplete todos display with red color and warning icon
- [ ] Completed todos never show overdue styling (even if past due date)
- [ ] Today's date todos do not show as overdue
- [ ] Future todos do not show as overdue
- [ ] Todos without due dates do not show as overdue
- [ ] Overdue styling updates immediately when toggling completion
- [ ] Overdue styling updates immediately when editing due date
- [ ] Overdue todos appear at top of list
- [ ] Multiple overdue todos sorted by due date (oldest first)
- [ ] Badge displays correct overdue count
- [ ] Badge updates when todos marked complete
- [ ] Badge hidden when no overdue todos exist

### Code Quality
- [ ] All tests pass (100%)
- [ ] Test coverage ≥ 80%
- [ ] No linting errors
- [ ] Code follows 2-space indentation
- [ ] camelCase naming for variables/functions
- [ ] Comments explain "why" not "what"
- [ ] DRY principle followed (no duplicate date logic)

### Performance
- [ ] List renders in <100ms with 500 todos
- [ ] No visible lag when toggling completion
- [ ] No visible lag when editing due dates
- [ ] useMemo prevents unnecessary recalculations

### Accessibility
- [ ] Warning icon has aria-label
- [ ] Badge has aria-label with count
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works correctly

### Design Consistency
- [ ] Uses existing danger color variables
- [ ] Follows 8px spacing grid
- [ ] Material Design shadow/elevation
- [ ] Halloween theme compatible

## Common Issues & Solutions

### Issue: Tests Fail Due to Date/Time

**Solution**: Ensure Jest fake timers are set up correctly
```javascript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-02-04T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});
```

### Issue: TodoCard Tests Fail After Adding isOverdue

**Solution**: Mock dateUtils in tests
```javascript
jest.mock('../../utils/dateUtils', () => ({
  isOverdue: jest.fn(() => false)
}));
```

### Issue: useMemo Not Preventing Re-renders

**Solution**: Ensure todos array reference changes immutably
```javascript
// Bad (mutates array)
setTodos(todos.push(newTodo));

// Good (creates new array reference)
setTodos([...todos, newTodo]);
```

### Issue: CSS Not Applying

**Solution**: Check class name matches
```javascript
// Component
className={`todo-card ${isOverdueItem ? 'overdue' : ''}`}

// CSS
.todo-card.overdue { /* styles */ }
```

## Debugging Tips

### View Sorted Order
```javascript
// In TodoList.js, temporarily log sorted todos
console.log('Sorted todos:', sortedTodos.map(t => ({
  id: t.id,
  title: t.title,
  dueDate: t.dueDate,
  isOverdue: isOverdue(t.dueDate, t.completed)
})));
```

### Check isOverdue Logic
```javascript
// In browser console
import { isOverdue } from './utils/dateUtils';
isOverdue('2026-02-03', false); // Should return true if today is 2026-02-04
```

### Verify CSS Application
Use browser DevTools to inspect todo card elements:
1. Right-click overdue todo → Inspect
2. Check computed styles for `.todo-card.overdue`
3. Verify CSS variables (--danger-color) are defined

## Performance Testing

### Test with Large Dataset
```javascript
// In browser console
const largeTodoSet = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  title: `Todo ${i + 1}`,
  dueDate: i < 50 ? '2026-02-03' : '2026-02-10', // 50 overdue
  completed: false,
  createdAt: new Date().toISOString()
}));

// Time the render
console.time('render');
// Trigger re-render with 500 todos
console.timeEnd('render');
// Should be <100ms
```

## Next Steps

After completing development:

1. **Code Review**: Create pull request with comprehensive description
2. **Manual Testing**: Test in Chrome, Firefox, Safari
3. **Accessibility Audit**: Use axe DevTools or Lighthouse
4. **Performance Validation**: Test with 500 todos, verify <100ms
5. **Documentation**: Update README if needed
6. **Merge**: Get approval and merge to main

## Resources

- **Spec**: [spec.md](spec.md)
- **Plan**: [plan.md](plan.md)
- **Research**: [research.md](research.md)
- **Data Model**: [data-model.md](data-model.md)
- **Contracts**: [contracts/frontend.md](contracts/frontend.md)
- **Constitution**: `.specify/memory/constitution.md`
- **UI Guidelines**: `/docs/ui-guidelines.md`
- **Coding Guidelines**: `/docs/coding-guidelines.md`
- **Testing Guidelines**: `/docs/testing-guidelines.md`
