# Data Model: Overdue Todo Items

**Feature**: 001-overdue-todos  
**Date**: 2026-02-04  
**Related**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md)

## Overview

This document defines the data structures for the overdue todos feature. No database schema changes are required - the overdue status is a derived property calculated client-side from existing fields.

## Entity: Todo (Existing - No Changes)

### Database Schema (SQLite)

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  dueDate TEXT,           -- ISO 8601 date string (YYYY-MM-DD) or NULL
  completed INTEGER DEFAULT 0,  -- 0 = incomplete, 1 = complete
  createdAt TEXT DEFAULT (datetime('now'))  -- ISO 8601 timestamp
);
```

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| title | TEXT | NOT NULL, max 255 chars | Todo description |
| dueDate | TEXT | NULLABLE, ISO 8601 format | Due date (YYYY-MM-DD) or null |
| completed | INTEGER | DEFAULT 0 (0 or 1) | Completion status |
| createdAt | TEXT | DEFAULT now(), ISO 8601 | Creation timestamp |

### Example Records

```json
[
  {
    "id": 1,
    "title": "Complete project proposal",
    "dueDate": "2026-02-03",
    "completed": 0,
    "createdAt": "2026-02-01T10:30:00Z"
  },
  {
    "id": 2,
    "title": "Review pull requests",
    "dueDate": "2026-02-05",
    "completed": 0,
    "createdAt": "2026-02-02T14:20:00Z"
  },
  {
    "id": 3,
    "title": "Buy Halloween decorations",
    "dueDate": "2026-01-30",
    "completed": 1,
    "createdAt": "2026-01-28T09:15:00Z"
  },
  {
    "id": 4,
    "title": "Research new frameworks",
    "dueDate": null,
    "completed": 0,
    "createdAt": "2026-02-04T08:00:00Z"
  }
]
```

## Derived Property: isOverdue (Client-Side)

### Calculation Logic

```javascript
/**
 * Determines if a todo is overdue
 * @param {string|null} dueDate - ISO date string (YYYY-MM-DD) or null
 * @param {boolean} completed - Completion status
 * @returns {boolean} True if overdue, false otherwise
 */
function isOverdue(dueDate, completed) {
  // Not overdue if completed or no due date
  if (completed || !dueDate) {
    return false;
  }
  
  // Compare dates only (strip time components)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  // Overdue if due date is before today (not including today)
  return due < today;
}
```

### Truth Table

| dueDate | completed | Today | Result | Reason |
|---------|-----------|-------|--------|--------|
| "2026-02-03" | false | 2026-02-04 | **true** | Past date, incomplete |
| "2026-02-04" | false | 2026-02-04 | **false** | Today's date (not overdue) |
| "2026-02-05" | false | 2026-02-04 | **false** | Future date |
| "2026-02-03" | true | 2026-02-04 | **false** | Completed (overdue status cleared) |
| null | false | 2026-02-04 | **false** | No due date set |
| undefined | false | 2026-02-04 | **false** | No due date set |

### Edge Cases Handled

1. **Null/undefined dates**: Return false (no due date = never overdue)
2. **Completed items**: Return false regardless of date (completion clears overdue status)
3. **Today's date**: Return false (only *past* dates are overdue, per FR-009)
4. **Invalid date strings**: Handled by Date constructor, return false if parsing fails
5. **Time components**: Stripped via setHours(0,0,0,0) - compare dates only

## Data Flow

### On Page Load

```
1. Backend: Fetch todos from database
   GET /api/todos
   └── Returns: Array of todo objects with dueDate strings

2. Frontend: Receive todos via axios
   └── Store in React state

3. Frontend: Calculate derived properties
   todos.map(todo => ({
     ...todo,
     isOverdue: isOverdue(todo.dueDate, todo.completed)
   }))

4. Frontend: Sort todos by overdue status
   [overdue todos (oldest first)] + [other todos (newest first)]

5. Frontend: Render with visual indicators
   TodoCard applies .overdue class if isOverdue === true
```

### On Todo Completion Toggle

```
1. User clicks checkbox in TodoCard

2. Frontend: Call onToggle(todoId)

3. Backend: Update completed status
   PATCH /api/todos/:id/status
   └── Toggle completed: 0 ↔ 1

4. Backend: Return updated todo

5. Frontend: Update state with new completed value

6. Frontend: Recalculate isOverdue (immediate update)
   isOverdue(dueDate, newCompleted)

7. Frontend: Re-render with updated styling
   - If was overdue and now complete: remove red styling
   - If was complete and now incomplete + past date: add red styling
```

### On Due Date Edit

```
1. User edits due date in TodoCard

2. Frontend: Call onUpdate(todoId, { dueDate: newDate })

3. Backend: Update dueDate
   PATCH /api/todos/:id
   └── Update dueDate field

4. Backend: Return updated todo

5. Frontend: Update state with new dueDate

6. Frontend: Recalculate isOverdue (immediate update)
   isOverdue(newDueDate, completed)

7. Frontend: Re-render with updated styling
   - If changed from past to future: remove red styling
   - If changed from future to past: add red styling
```

## Component State Management

### TodoList Component

```javascript
// State
const [todos, setTodos] = useState([]);

// Derived state (using useMemo)
const sortedTodos = useMemo(() => {
  // Separate overdue from others
  const overdue = todos
    .filter(t => isOverdue(t.dueDate, t.completed))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // oldest first
  
  const others = todos
    .filter(t => !isOverdue(t.dueDate, t.completed))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first
  
  return [...overdue, ...others];
}, [todos]);

// Derived state for badge
const overdueCount = useMemo(() => {
  return todos.filter(t => isOverdue(t.dueDate, t.completed)).length;
}, [todos]);
```

### TodoCard Component

```javascript
// Props
const { todo, onToggle, onDelete, onUpdate } = props;

// Derived rendering flag
const isOverdueItem = isOverdue(todo.dueDate, todo.completed);

// Conditional className
<div className={`todo-card ${isOverdueItem ? 'overdue' : ''}`}>
  {isOverdueItem && <span className="overdue-icon">⚠️</span>}
  {/* ... rest of card content ... */}
</div>
```

## Data Validation

### Backend (Existing - No Changes)

```javascript
// From todoService.js
// Validation already in place:
- title: required, non-empty string, max 255 chars
- dueDate: optional, accepts ISO string or null
- completed: boolean converted to 0/1 for SQLite
- createdAt: auto-generated timestamp
```

### Frontend (New Validation in dateUtils)

```javascript
function isOverdue(dueDate, completed) {
  // Validate inputs
  if (typeof completed !== 'boolean') {
    console.warn('Invalid completed value, treating as false');
    completed = false;
  }
  
  if (!dueDate || typeof dueDate !== 'string') {
    return false;
  }
  
  // Attempt date parsing
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) {
    console.warn(`Invalid date format: ${dueDate}`);
    return false;
  }
  
  // Continue with comparison...
}
```

## Performance Considerations

### Computational Complexity

- **isOverdue() per todo**: O(1) - constant time date comparison
- **Sorting N todos**: O(N log N) - standard sort algorithm
- **Filter + sort**: O(2N log N) ≈ O(N log N)

### Memory Footprint

- **No additional storage**: Derived property calculated on-demand
- **Sorting creates new array**: Minimal overhead (array of references)
- **useMemo caching**: Prevents recalculation on every render

### Scale Testing

Per SC-005: System must handle 500 todos with <100ms render time

**Expected Performance**:
- 500 todos × O(1) overdue checks = ~0.5ms
- Sorting 500 items = ~5-10ms
- React rendering 500 TodoCards = ~50-80ms
- **Total estimated**: ~55-90ms ✅ Meets target

## Data Migration

**No migration required** - This is a presentation-layer feature using existing data structures.

### Verification Checklist

- [x] No new database columns
- [x] No schema changes
- [x] No data seeding required
- [x] Backward compatible (no API changes)
- [x] Works with existing todo data

## API Impact

**No API changes required** - All existing endpoints remain unchanged:

- `GET /api/todos` - Returns todos with dueDate field (existing)
- `POST /api/todos` - Creates todo with optional dueDate (existing)
- `PATCH /api/todos/:id` - Updates title and/or dueDate (existing)
- `PATCH /api/todos/:id/status` - Toggles completed status (existing)
- `DELETE /api/todos/:id` - Deletes todo (existing)

Frontend calculates overdue status from response data.

## Summary

- **Entity**: Todo (existing, no changes)
- **Derived Property**: isOverdue (client-side calculation)
- **Storage**: No additional database fields
- **Performance**: O(N log N) sorting, optimized with useMemo
- **Validation**: Robust handling of null/invalid dates
- **Migration**: None required
- **API**: No changes

This approach adheres to constitution principles:
- ✅ Simplicity (KISS): No database changes
- ✅ DRY: Date logic centralized in dateUtils
- ✅ SOLID: Single responsibility (dateUtils for dates, components for UI)
- ✅ No premature optimization: useMemo only where needed
