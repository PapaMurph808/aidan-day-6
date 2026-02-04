import React from 'react';
import { render, screen } from '@testing-library/react';
import TodoList from '../TodoList';

describe('TodoList Component', () => {
  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  const mockTodos = [
    {
      id: 1,
      title: 'Todo 1',
      dueDate: '2025-12-25',
      completed: 0,
      createdAt: '2025-11-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Todo 2',
      dueDate: null,
      completed: 1,
      createdAt: '2025-11-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when todos array is empty', () => {
    render(<TodoList todos={[]} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText(/No todos yet. Add one to get started!/)).toBeInTheDocument();
  });

  it('should render all todos when provided', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  it('should render correct number of todo cards', () => {
    const { container } = render(
      <TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />
    );
    
    const cards = container.querySelectorAll('.todo-card');
    expect(cards).toHaveLength(2);
  });

  it('should pass handlers to TodoCard components', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    // Verify that edit buttons exist for each todo
    expect(screen.getAllByLabelText(/Edit/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Delete/)).toHaveLength(2);
  });

  describe('Overdue Todo Sorting (User Story 2)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Set current date to February 4, 2026
      jest.setSystemTime(new Date('2026-02-04T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should display overdue todos before non-overdue todos', () => {
      const mixedTodos = [
        {
          id: 1,
          title: 'Future Todo',
          dueDate: '2026-02-10',
          completed: 0,
          createdAt: '2026-02-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'Overdue Todo',
          dueDate: '2026-02-01',
          completed: 0,
          createdAt: '2026-01-30T00:00:00Z'
        },
        {
          id: 3,
          title: 'No Date Todo',
          dueDate: null,
          completed: 0,
          createdAt: '2026-02-03T00:00:00Z'
        }
      ];

      const { container } = render(
        <TodoList todos={mixedTodos} {...mockHandlers} isLoading={false} />
      );

      const cards = container.querySelectorAll('.todo-card');
      const titles = Array.from(cards).map(card => 
        card.querySelector('.todo-title').textContent
      );

      // Overdue todo should be first
      expect(titles[0]).toBe('Overdue Todo');
    });

    it('should sort overdue todos by due date (oldest first)', () => {
      const overdueTodos = [
        {
          id: 1,
          title: 'Less Overdue',
          dueDate: '2026-02-03',
          completed: 0,
          createdAt: '2026-02-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'Most Overdue',
          dueDate: '2026-01-15',
          completed: 0,
          createdAt: '2026-01-10T00:00:00Z'
        },
        {
          id: 3,
          title: 'Moderately Overdue',
          dueDate: '2026-02-01',
          completed: 0,
          createdAt: '2026-01-28T00:00:00Z'
        }
      ];

      const { container } = render(
        <TodoList todos={overdueTodos} {...mockHandlers} isLoading={false} />
      );

      const cards = container.querySelectorAll('.todo-card');
      const titles = Array.from(cards).map(card => 
        card.querySelector('.todo-title').textContent
      );

      // Should be sorted by due date ascending (oldest first)
      expect(titles[0]).toBe('Most Overdue');
      expect(titles[1]).toBe('Moderately Overdue');
      expect(titles[2]).toBe('Less Overdue');
    });

    it('should sort non-overdue todos by creation date (newest first)', () => {
      const nonOverdueTodos = [
        {
          id: 1,
          title: 'Oldest',
          dueDate: '2026-02-10',
          completed: 0,
          createdAt: '2026-02-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'Newest',
          dueDate: '2026-02-15',
          completed: 0,
          createdAt: '2026-02-03T00:00:00Z'
        },
        {
          id: 3,
          title: 'Middle',
          dueDate: null,
          completed: 0,
          createdAt: '2026-02-02T00:00:00Z'
        }
      ];

      const { container } = render(
        <TodoList todos={nonOverdueTodos} {...mockHandlers} isLoading={false} />
      );

      const cards = container.querySelectorAll('.todo-card');
      const titles = Array.from(cards).map(card => 
        card.querySelector('.todo-title').textContent
      );

      // Should be sorted by createdAt descending (newest first)
      expect(titles[0]).toBe('Newest');
      expect(titles[1]).toBe('Middle');
      expect(titles[2]).toBe('Oldest');
    });

    it('should place all overdue todos before all non-overdue todos', () => {
      const mixedTodos = [
        {
          id: 1,
          title: 'Future 1',
          dueDate: '2026-02-10',
          completed: 0,
          createdAt: '2026-02-04T00:00:00Z'
        },
        {
          id: 2,
          title: 'Overdue 1',
          dueDate: '2026-02-03',
          completed: 0,
          createdAt: '2026-02-01T00:00:00Z'
        },
        {
          id: 3,
          title: 'Future 2',
          dueDate: '2026-02-08',
          completed: 0,
          createdAt: '2026-02-03T00:00:00Z'
        },
        {
          id: 4,
          title: 'Overdue 2',
          dueDate: '2026-02-01',
          completed: 0,
          createdAt: '2026-01-30T00:00:00Z'
        }
      ];

      const { container } = render(
        <TodoList todos={mixedTodos} {...mockHandlers} isLoading={false} />
      );

      const cards = container.querySelectorAll('.todo-card');
      const titles = Array.from(cards).map(card => 
        card.querySelector('.todo-title').textContent
      );

      // First two should be overdue (sorted by due date, oldest first)
      expect(titles[0]).toBe('Overdue 2');
      expect(titles[1]).toBe('Overdue 1');
      // Last two should be non-overdue (sorted by created date, newest first)
      expect(titles[2]).toBe('Future 1'); // created 2026-02-04 (newer)
      expect(titles[3]).toBe('Future 2'); // created 2026-02-03 (older)
    });
  });

  describe('Overdue Count Badge (User Story 3)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-02-04T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should display badge with correct overdue count', () => {
      const mixedTodos = [
        {
          id: 1,
          title: 'Overdue 1',
          dueDate: '2026-02-03',
          completed: 0,
          createdAt: '2026-02-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'Future',
          dueDate: '2026-02-10',
          completed: 0,
          createdAt: '2026-02-02T00:00:00Z'
        },
        {
          id: 3,
          title: 'Overdue 2',
          dueDate: '2026-02-01',
          completed: 0,
          createdAt: '2026-01-30T00:00:00Z'
        }
      ];

      render(<TodoList todos={mixedTodos} {...mockHandlers} isLoading={false} />);

      const badge = screen.getByLabelText(/overdue todo/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('2');
    });

    it('should hide badge when count is 0', () => {
      const nonOverdueTodos = [
        {
          id: 1,
          title: 'Future',
          dueDate: '2026-02-10',
          completed: 0,
          createdAt: '2026-02-02T00:00:00Z'
        },
        {
          id: 2,
          title: 'No Date',
          dueDate: null,
          completed: 0,
          createdAt: '2026-02-03T00:00:00Z'
        }
      ];

      render(<TodoList todos={nonOverdueTodos} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByLabelText(/overdue todo/i)).not.toBeInTheDocument();
    });

    it('should update badge count when overdue todo is completed', () => {
      const initialTodos = [
        {
          id: 1,
          title: 'Overdue 1',
          dueDate: '2026-02-03',
          completed: 0,
          createdAt: '2026-02-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'Overdue 2',
          dueDate: '2026-02-02',
          completed: 0,
          createdAt: '2026-02-01T00:00:00Z'
        }
      ];

      const { rerender } = render(
        <TodoList todos={initialTodos} {...mockHandlers} isLoading={false} />
      );

      // Initially 2 overdue
      let badge = screen.getByLabelText(/overdue todo/i);
      expect(badge).toHaveTextContent('2');

      // Complete one overdue todo
      const updatedTodos = [
        {
          id: 1,
          title: 'Overdue 1',
          dueDate: '2026-02-03',
          completed: 1,
          createdAt: '2026-02-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'Overdue 2',
          dueDate: '2026-02-02',
          completed: 0,
          createdAt: '2026-02-01T00:00:00Z'
        }
      ];

      rerender(<TodoList todos={updatedTodos} {...mockHandlers} isLoading={false} />);

      // Now 1 overdue
      badge = screen.getByLabelText(/overdue todo/i);
      expect(badge).toHaveTextContent('1');
    });

    it('should show badge when todo becomes overdue', () => {
      const futureTodos = [
        {
          id: 1,
          title: 'Future',
          dueDate: '2026-02-10',
          completed: 0,
          createdAt: '2026-02-02T00:00:00Z'
        }
      ];

      const { rerender } = render(
        <TodoList todos={futureTodos} {...mockHandlers} isLoading={false} />
      );

      // No badge initially
      expect(screen.queryByLabelText(/overdue todo/i)).not.toBeInTheDocument();

      // Change due date to past
      const overdueTodos = [
        {
          id: 1,
          title: 'Now Overdue',
          dueDate: '2026-02-01',
          completed: 0,
          createdAt: '2026-02-02T00:00:00Z'
        }
      ];

      rerender(<TodoList todos={overdueTodos} {...mockHandlers} isLoading={false} />);

      // Badge should appear
      const badge = screen.getByLabelText(/overdue todo/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('1');
    });
  });
});
