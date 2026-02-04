# Implementation Plan: Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-overdue-todos/spec.md`

## Summary

Add visual indicators (red color + warning icon) to distinguish overdue todos from current/future items. Overdue items are automatically sorted to the top of the list and counted in a badge. The feature calculates overdue status at page load by comparing due dates (date-only, no time) against the current date, and immediately updates when users mark items complete or edit due dates.

## Technical Context

**Language/Version**: JavaScript (ES6+), Node.js v16+, React 18.2  
**Primary Dependencies**: React, React DOM, Express.js, better-sqlite3, axios  
**Storage**: SQLite (better-sqlite3) with in-memory database; existing `todos` table with id, title, dueDate, completed, createdAt  
**Testing**: Jest + React Testing Library (frontend), Jest + supertest (backend)  
**Target Platform**: Web application (desktop-focused), Chrome/Firefox/Safari latest versions  
**Project Type**: Web application - Monorepo with separate frontend/backend packages  
**Performance Goals**: <100ms render time for lists up to 500 todos, <500ms API response time  
**Constraints**: No new database fields required, date-only comparison (no time), overdue calculated client-side  
**Scale/Scope**: Single-user application, ~10-50 typical todos per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with project constitution (`.specify/memory/constitution.md`):

- [x] **Test-First Development**: Tests will be written before implementation (TDD workflow)
- [x] **Code Quality**: Feature design adheres to DRY, KISS, and SOLID principles
- [x] **Test Coverage**: Plan includes achieving 80%+ test coverage
- [x] **Error Handling**: Design includes comprehensive error handling and user feedback
- [x] **Simplicity**: Feature scope is minimal, avoids premature optimization and gold-plating
- [x] **Formatting Standards**: Team is aware of 2-space indentation and naming conventions
- [x] **Design Consistency**: UI features follow Material Design and Halloween theme guidelines

*Note: All checks passed. This is a presentation-layer feature with no new persistence, leveraging existing data structures and following established patterns.*

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todos/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (entity relationships)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
│   └── frontend.md      # Frontend component interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── todoService.js     # Existing - no changes needed
│   │   ├── app.js                 # Existing - no changes needed
│   │   └── index.js               # Existing - no changes needed
│   └── __tests__/
│       └── app.test.js            # Existing - no changes needed
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── TodoCard.js        # MODIFY - Add overdue visual indicators
    │   │   ├── TodoList.js        # MODIFY - Add sorting logic and count badge
    │   │   └── __tests__/
    │   │       ├── TodoCard.test.js       # MODIFY - Add overdue tests
    │   │       └── TodoList.test.js       # MODIFY - Add sorting/badge tests
    │   ├── utils/
    │   │   ├── dateUtils.js       # NEW - Date comparison utilities
    │   │   └── __tests__/
    │   │       └── dateUtils.test.js      # NEW - Date utility tests
    │   └── App.css                # MODIFY - Add overdue styling
    └── public/
        └── index.html             # Existing - no changes needed
```

**Structure Decision**: Web application structure (frontend + backend). Backend requires no changes since overdue status is derived client-side from existing `dueDate` field. Frontend modifications focus on presentation layer: TodoList for sorting/badge, TodoCard for visual styling, new dateUtils for date comparison logic.

## Complexity Tracking

No constitution violations. This feature:
- Uses TDD workflow (tests before implementation)
- Follows DRY (single dateUtils module for date logic)
- Maintains simplicity (no new database fields, client-side calculation)
- Adheres to design system (Halloween theme colors, Material Design principles)
- Achieves 80%+ coverage target through comprehensive unit tests

## Phase 0: Research & Technology Decisions

### Research Areas

1. **Date Comparison Strategy**
   - Decision needed: Client-side vs. server-side calculation
   - Research: Performance implications, data freshness, complexity
   
2. **React Rendering Optimization**
   - Decision needed: Sorting approach for large lists
   - Research: useMemo for expensive calculations, memo for component re-renders

3. **Visual Design Patterns**
   - Decision needed: Icon choice and color scheme
   - Research: Accessibility (WCAG AA), Material Design patterns, Halloween theme alignment

4. **Testing Strategy**
   - Decision needed: Mocking Date.now() for consistent test results
   - Research: Jest date mocking patterns, timezone handling in tests

### Output: research.md

Document all decisions with rationale, alternatives considered, and implementation guidance.

## Phase 1: Design & Contracts

### Data Model (data-model.md)

**Entities**:

- **Todo** (existing, no changes)
  - id: integer (primary key)
  - title: string (max 255 characters)
  - dueDate: ISO date string or null
  - completed: boolean (stored as 0/1 in SQLite)
  - createdAt: ISO timestamp

**Derived Properties** (calculated client-side, not stored):

- **isOverdue**: boolean
  - Calculation: `!completed && dueDate && dateOnly(dueDate) < dateOnly(today)`
  - Updated: Page load, todo completion, due date edit

**Relationships**: No changes to existing data relationships

### API Contracts (contracts/frontend.md)

**Component Interfaces**:

```javascript
// dateUtils.js
interface DateUtils {
  isOverdue(dueDate: string, completed: boolean): boolean
  // Returns true if dueDate (YYYY-MM-DD) is before today and todo is incomplete
  // Returns false if no dueDate, completed, or dueDate is today/future
  
  formatDate(dateString: string): string
  // Existing utility - no changes
}

// TodoCard.js (enhanced)
interface TodoCardProps {
  todo: {
    id: number
    title: string
    dueDate: string | null
    completed: boolean
    createdAt: string
  }
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: object) => void
}

// TodoList.js (enhanced)
interface TodoListProps {
  todos: Array<Todo>
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: object) => void
}
```

**Sorting Logic**:
- Overdue incomplete todos first (sorted by dueDate ascending - oldest first)
- All other todos second (sorted by createdAt descending - newest first)

**Badge Logic**:
- Count: `todos.filter(t => isOverdue(t.dueDate, t.completed)).length`
- Display: Only show if count > 0

### Quickstart (quickstart.md)

**Development Setup**:
1. No new dependencies required
2. Run existing commands: `npm install`, `npm start`
3. Tests: `npm test`

**Testing Approach**:
1. Create dateUtils tests first (TDD)
2. Add TodoCard overdue visual tests
3. Add TodoList sorting and badge tests
4. Mock Date.now() for consistent results

**Deployment Notes**:
- No database migration needed
- No API changes
- Pure frontend feature

## Phase 2: Task Breakdown (NOT CREATED HERE)

*Phase 2 is handled by `/speckit.tasks` command, which will:*
- Break down implementation into story-based tasks
- Create test files before implementation files
- Assign priorities based on user story priorities (P1, P2, P3)
- Generate `/specs/001-overdue-todos/tasks.md`

**Expected Task Groups**:
1. P1: Visual Identification (dateUtils + TodoCard styling)
2. P2: Sorting & Positioning (TodoList sorting logic)
3. P3: Count Badge (TodoList badge component)

## Implementation Strategy

### 1. Foundation (P1 - Core Value)
- Create `dateUtils.js` with `isOverdue()` function
- Write comprehensive tests for date comparison edge cases
- Add overdue styling to `App.css` (red color, warning icon)
- Modify `TodoCard.js` to apply styling based on `isOverdue()`
- Test all TodoCard scenarios from spec

### 2. Enhanced Discovery (P2)
- Modify `TodoList.js` to implement two-tier sorting
- Test sorting with mixed overdue/current/future todos
- Verify oldest overdue items appear first

### 3. Quick Awareness (P3)
- Add badge component to `TodoList.js` header
- Calculate and display overdue count
- Test badge visibility and count accuracy

### 4. Integration & Polish
- Verify immediate updates on completion toggle
- Verify immediate updates on due date edit
- Cross-browser testing (Chrome, Firefox, Safari)
- Performance testing with large lists (500 items)

## Success Metrics

From spec success criteria:
- SC-001: Users identify overdue todos within 2 seconds (visual distinction)
- SC-002: 95% accuracy in identifying overdue items (user testing)
- SC-003: 40% reduction in scanning time (efficiency measurement)
- SC-004: Count updates within 1 second (implementation target)
- SC-005: <100ms render for 500 todos (performance testing)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Date calculation inconsistency | Medium | Comprehensive dateUtils tests covering edge cases, timezone handling |
| Performance with large lists | Low | Use React.useMemo for expensive sorting calculations |
| Accessibility concerns | Medium | Ensure color + icon combo meets WCAG AA, test with screen readers |
| Browser date parsing differences | Low | Use ISO format (YYYY-MM-DD) consistently, test across browsers |

## Next Steps

1. ✅ Complete `/speckit.plan` (this document)
2. ⏭️ Run `/speckit.tasks` to generate task breakdown
3. ⏭️ Begin TDD implementation starting with P1 tasks
4. ⏭️ Iterate through P2 and P3 based on priorities
5. ⏭️ Integration testing and polish
