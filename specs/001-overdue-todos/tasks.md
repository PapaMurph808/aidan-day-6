---
description: "Task list for overdue todo items feature implementation"
---

# Tasks: Overdue Todo Items

**Input**: Design documents from `/specs/001-overdue-todos/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/frontend.md

**Tests**: Tests are REQUIRED for this feature (TDD workflow per constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `packages/backend/src/`, `packages/frontend/src/`
- All paths use absolute references from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify existing project dependencies in packages/frontend/package.json and packages/backend/package.json
- [X] T002 [P] Create utils directory structure at packages/frontend/src/utils/ for date utilities
- [X] T003 [P] Create __tests__ directory at packages/frontend/src/utils/__tests__/ for date utility tests

**Checkpoint**: Directory structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core date comparison utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create failing test for isOverdue() function in packages/frontend/src/utils/__tests__/dateUtils.test.js
- [X] T005 Implement isOverdue() date comparison function in packages/frontend/src/utils/dateUtils.js
- [X] T006 Add edge case tests for isOverdue() (null dates, completed items, boundary dates) in packages/frontend/src/utils/__tests__/dateUtils.test.js
- [X] T007 Configure Jest mock timers for deterministic date testing in packages/frontend/src/utils/__tests__/dateUtils.test.js

**Checkpoint**: Foundation ready - dateUtils.isOverdue() fully tested and working. User story implementation can now begin.

---

## Phase 3: User Story 1 - Visual Identification of Overdue Todos (Priority: P1) 🎯 MVP

**Goal**: Users can quickly scan their todo list and immediately identify which items are past their due date through distinct visual styling (red color + warning icon)

**Independent Test**: Create todos with past due dates and verify they display with red color styling and ⚠️ warning icon. Create todos with today/future dates and verify they display with normal styling.

### Tests for User Story 1 (TDD Workflow)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T008 [P] [US1] Add failing test for overdue todo styling (past date, incomplete) in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T009 [P] [US1] Add failing test for non-overdue styling (today's date) in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T010 [P] [US1] Add failing test for non-overdue styling (future date) in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T011 [P] [US1] Add failing test for non-overdue styling (completed past todo) in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T012 [P] [US1] Add failing test for non-overdue styling (no due date) in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T013 [P] [US1] Add failing test for styling removal when due date changes from past to future in packages/frontend/src/components/__tests__/TodoCard.test.js

### Implementation for User Story 1

- [X] T014 [US1] Import isOverdue utility in packages/frontend/src/components/TodoCard.js
- [X] T015 [US1] Add overdue status calculation logic in packages/frontend/src/components/TodoCard.js
- [X] T016 [US1] Add conditional CSS class 'overdue' to todo card in packages/frontend/src/components/TodoCard.js
- [X] T017 [US1] Add warning icon (⚠️) with conditional rendering in packages/frontend/src/components/TodoCard.js
- [X] T018 [US1] Add ARIA label to warning icon for accessibility in packages/frontend/src/components/TodoCard.js
- [X] T019 [US1] Create CSS styles for .todo-card.overdue class in packages/frontend/src/App.css
- [X] T020 [US1] Add red border-left styling (4px solid) in packages/frontend/src/App.css
- [X] T021 [US1] Add light red background tint (rgba(239, 83, 80, 0.05)) in packages/frontend/src/App.css
- [X] T022 [US1] Add danger color to overdue title text in packages/frontend/src/App.css
- [X] T023 [US1] Add styling for .overdue-icon class (color, margin, size) in packages/frontend/src/App.css
- [X] T024 [US1] Verify all TodoCard tests pass with mock timer setup in packages/frontend/src/components/__tests__/TodoCard.test.js

**Checkpoint**: At this point, User Story 1 should be fully functional - todos with past due dates display with red styling and warning icon. Test independently by creating various todos and checking visual indicators.

---

## Phase 4: User Story 2 - Overdue Todo Sorting and Grouping (Priority: P2)

**Goal**: Overdue items are prominently positioned at the top of the todo list, sorted by due date (oldest first), so users can address urgent tasks without scrolling

**Independent Test**: Create a mix of overdue, current, and future todos. Verify overdue incomplete todos appear at the top of the list, sorted by due date with oldest first. Other todos appear below, sorted by creation date (newest first).

### Tests for User Story 2 (TDD Workflow)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T025 [P] [US2] Add failing test for overdue todos appearing first in list in packages/frontend/src/components/__tests__/TodoList.test.js
- [X] T026 [P] [US2] Add failing test for overdue todos sorted by due date (oldest first) in packages/frontend/src/components/__tests__/TodoList.test.js
- [X] T027 [P] [US2] Add failing test for non-overdue todos appearing after overdue in packages/frontend/src/components/__tests__/TodoList.test.js
- [X] T028 [P] [US2] Add failing test for non-overdue todos sorted by creation date (newest first) in packages/frontend/src/components/__tests__/TodoList.test.js

### Implementation for User Story 2

- [X] T029 [US2] Import isOverdue utility and useMemo hook in packages/frontend/src/components/TodoList.js
- [X] T030 [US2] Add useMemo hook to memoize sorted todos array in packages/frontend/src/components/TodoList.js
- [X] T031 [US2] Implement overdue filtering logic (filter todos by isOverdue) in packages/frontend/src/components/TodoList.js
- [X] T032 [US2] Implement overdue sorting logic (sort by dueDate ascending) in packages/frontend/src/components/TodoList.js
- [X] T033 [US2] Implement non-overdue filtering logic in packages/frontend/src/components/TodoList.js
- [X] T034 [US2] Implement non-overdue sorting logic (sort by createdAt descending) in packages/frontend/src/components/TodoList.js
- [X] T035 [US2] Concatenate overdue and non-overdue arrays in correct order in packages/frontend/src/components/TodoList.js
- [X] T036 [US2] Update TodoList rendering to use sortedTodos instead of todos prop in packages/frontend/src/components/TodoList.js
- [X] T037 [US2] Verify all TodoList sorting tests pass in packages/frontend/src/components/__tests__/TodoList.test.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Overdue todos appear at top with visual styling, sorted correctly, followed by other todos.

---

## Phase 5: User Story 3 - Overdue Count Badge (Priority: P3)

**Goal**: Users see at a glance how many overdue tasks they have via a badge/counter, providing quick awareness of workload urgency without scanning the entire list

**Independent Test**: Create varying numbers of overdue todos (0, 1, 5, etc.). Verify count badge displays accurately. Mark overdue todo as complete and verify count decrements. Verify badge hides when count is 0.

### Tests for User Story 3 (TDD Workflow)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T038 [P] [US3] Add failing test for badge displaying correct overdue count in packages/frontend/src/components/__tests__/TodoList.test.js
- [X] T039 [P] [US3] Add failing test for badge hidden when count is 0 in packages/frontend/src/components/__tests__/TodoList.test.js
- [X] T040 [P] [US3] Add failing test for badge count decrementing when overdue todo completed in packages/frontend/src/components/__tests__/TodoList.test.js
- [X] T041 [P] [US3] Add failing test for badge count incrementing when todo becomes overdue in packages/frontend/src/components/__tests__/TodoList.test.js

### Implementation for User Story 3

- [X] T042 [US3] Calculate overdue count using filter and isOverdue in packages/frontend/src/components/TodoList.js
- [X] T043 [US3] Add conditional rendering for badge (only show if count > 0) in packages/frontend/src/components/TodoList.js
- [X] T044 [US3] Create badge HTML element with overdue count in packages/frontend/src/components/TodoList.js
- [X] T045 [US3] Add ARIA label for accessibility to badge in packages/frontend/src/components/TodoList.js
- [X] T046 [US3] Create CSS styles for .overdue-badge class in packages/frontend/src/App.css
- [X] T047 [US3] Add badge positioning styles (top-right or inline with header) in packages/frontend/src/App.css
- [X] T048 [US3] Add danger color background and white text to badge in packages/frontend/src/App.css
- [X] T049 [US3] Add border-radius and padding for badge pill shape in packages/frontend/src/App.css
- [X] T050 [US3] Verify all TodoList badge tests pass in packages/frontend/src/components/__tests__/TodoList.test.js

**Checkpoint**: All user stories should now be independently functional. Users can visually identify overdue todos (US1), see them sorted at the top (US2), and view the overdue count in a badge (US3).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T051 [P] Update dark mode CSS variables for overdue styling in packages/frontend/src/styles/theme.css
- [X] T052 [P] Verify WCAG AA contrast ratios for overdue colors (light and dark mode) using contrast checker
- [ ] T053 Test overdue feature with 500 todos using React DevTools Profiler and verify <100ms render time
- [X] T054 [P] Add JSDoc comments to isOverdue function in packages/frontend/src/utils/dateUtils.js
- [X] T055 [P] Review and cleanup console.log statements across all modified files
- [ ] T056 Verify all tests pass with coverage >80% by running npm test -- --coverage
- [ ] T057 Manual testing: Follow quickstart.md validation scenarios for all user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - US1 (P1) can start after Phase 2
  - US2 (P2) depends on US1 completion (needs TodoCard styling in place)
  - US3 (P3) can start after Phase 2, runs parallel with US1/US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Should start after US1 for visual consistency, but technically independent (uses same isOverdue utility)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Completely independent, only depends on isOverdue utility

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD workflow)
- Parallel tests (marked [P]) can run simultaneously
- Implementation tasks follow TDD: test → code → verify
- Story complete before moving to next priority

### Parallel Opportunities

#### Phase 1: Setup
- T002 and T003 can run in parallel (different directories)

#### Phase 2: Foundational
- No parallelization (sequential TDD workflow)

#### Phase 3: User Story 1
- Tests T008-T013 can run in parallel (all in same file, different test cases)
- T019-T023 can run in parallel (all CSS additions to same file)

#### Phase 4: User Story 2
- Tests T025-T028 can run in parallel (all in same file, different test cases)
- T031-T036 must run sequentially (all modify same function logic)

#### Phase 5: User Story 3
- Tests T038-T041 can run in parallel (all in same file, different test cases)
- T046-T049 can run in parallel (all CSS additions to same file)

#### Phase 6: Polish
- T051, T052, T054, T055 can all run in parallel (different files/concerns)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T008: "Add failing test for overdue todo styling (past date, incomplete)"
Task T009: "Add failing test for non-overdue styling (today's date)"
Task T010: "Add failing test for non-overdue styling (future date)"
Task T011: "Add failing test for non-overdue styling (completed past todo)"
Task T012: "Add failing test for non-overdue styling (no due date)"
Task T013: "Add failing test for styling removal when due date changes"

# After tests fail, implement sequentially:
Task T014-T018: TodoCard.js logic changes (sequential)
Task T019-T023: App.css styling (can be parallel)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - CRITICAL
3. Complete Phase 3: User Story 1 (T008-T024)
4. **STOP and VALIDATE**: Test US1 independently with various todos
5. Deploy/demo if ready - MVP delivers immediate value!

### Incremental Delivery

1. Setup + Foundational (T001-T007) → Foundation ready
2. Add User Story 1 (T008-T024) → Test independently → Deploy/Demo (MVP! Visual identification working)
3. Add User Story 2 (T025-T037) → Test independently → Deploy/Demo (Sorting added)
4. Add User Story 3 (T038-T050) → Test independently → Deploy/Demo (Badge added)
5. Polish (T051-T057) → Final validation → Production ready
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T007)
2. Once Foundational is done:
   - Developer A: User Story 1 (T008-T024)
   - Developer B: Can prepare tests for User Story 3 (T038-T041) in parallel
3. After US1 completes:
   - Developer A: User Story 2 (T025-T037)
   - Developer B: User Story 3 implementation (T042-T050)
4. Team: Polish together (T051-T057)

---

## Notes

- **TDD Workflow**: ALL tests written before implementation, verified to fail
- **Mock Timers**: Use jest.useFakeTimers() and jest.setSystemTime() for deterministic date testing
- **[P] tasks**: Different files or independent test cases, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story**: Independently completable and testable
- **No backend changes**: All logic client-side using existing dueDate field
- **Coverage target**: >80% per constitution requirements
- **Commit strategy**: Commit after each task or logical group
- **Stop at checkpoints**: Validate each story independently before proceeding
- **Performance**: Verify <100ms render time with 500 todos (SC-005)
