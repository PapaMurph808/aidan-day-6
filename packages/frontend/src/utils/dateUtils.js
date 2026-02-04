/**
 * Determines if a todo is overdue based on its due date and completion status
 * 
 * @param {string|null|undefined} dueDate - ISO 8601 date string (YYYY-MM-DD) or null/undefined
 * @param {boolean} completed - Whether the todo is marked as complete
 * @returns {boolean} True if the todo is overdue, false otherwise
 * 
 * @example
 * // Overdue: past date, incomplete
 * isOverdue('2026-02-03', false); // true (if today is 2026-02-04)
 * 
 * // Not overdue: today's date
 * isOverdue('2026-02-04', false); // false (if today is 2026-02-04)
 * 
 * // Not overdue: future date
 * isOverdue('2026-02-05', false); // false
 * 
 * // Not overdue: completed (even if past)
 * isOverdue('2026-02-03', true); // false
 * 
 * // Not overdue: no due date
 * isOverdue(null, false); // false
 */
export function isOverdue(dueDate, completed) {
  // Completed todos are never overdue
  if (completed) {
    return false;
  }

  // No due date means never overdue
  if (!dueDate) {
    return false;
  }

  // Try to parse the due date
  const due = new Date(dueDate);
  
  // Invalid date string
  if (isNaN(due.getTime())) {
    return false;
  }

  // Get today's date with time stripped (date-only comparison)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Strip time from due date for date-only comparison
  due.setHours(0, 0, 0, 0);

  // Overdue if due date is before today (not including today)
  return due < today;
}
