import React, { useMemo } from 'react';
import TodoCard from './TodoCard';
import { isOverdue } from '../utils/dateUtils';

function TodoList({ todos, onToggle, onEdit, onDelete, isLoading }) {
  // Sort todos: overdue first (by due date ascending), then others (by creation date descending)
  const sortedTodos = useMemo(() => {
    // Separate overdue and non-overdue todos
    const overdue = todos
      .filter(todo => isOverdue(todo.dueDate, Boolean(todo.completed)))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    const others = todos
      .filter(todo => !isOverdue(todo.dueDate, Boolean(todo.completed)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return [...overdue, ...others];
  }, [todos]);

  // Calculate overdue count for badge
  const overdueCount = useMemo(() => {
    return todos.filter(todo => isOverdue(todo.dueDate, Boolean(todo.completed))).length;
  }, [todos]);

  if (todos.length === 0) {
    return (
      <div className="todo-list empty-state">
        <p className="empty-state-message">
          No todos yet. Add one to get started! 👻
        </p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {overdueCount > 0 && (
        <div className="overdue-badge" aria-label={`${overdueCount} overdue todo${overdueCount === 1 ? '' : 's'}`}>
          {overdueCount}
        </div>
      )}
      {sortedTodos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

export default TodoList;
