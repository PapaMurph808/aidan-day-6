import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: '2025-12-25',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo title and due date', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
  });

  it('should render unchecked checkbox when todo is incomplete', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when todo is complete', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show edit button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should apply completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    const { container } = render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const card = container.querySelector('.todo-card');
    expect(card).toHaveClass('completed');
  });

  it('should not render due date when dueDate is null', () => {
    const todoNoDate = { ...mockTodo, dueDate: null };
    render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  describe('Overdue Indicators (User Story 1)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Set current date to February 4, 2026
      jest.setSystemTime(new Date('2026-02-04T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should display overdue styling for past incomplete todo', () => {
      const overdueTodo = { ...mockTodo, dueDate: '2026-02-03', completed: 0 };
      const { container } = render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      const card = container.querySelector('.todo-card');
      expect(card).toHaveClass('overdue');
      expect(screen.getByLabelText('Overdue')).toBeInTheDocument();
    });

    it('should NOT display overdue styling for today\'s date', () => {
      const todayTodo = { ...mockTodo, dueDate: '2026-02-04', completed: 0 };
      const { container } = render(<TodoCard todo={todayTodo} {...mockHandlers} isLoading={false} />);
      
      const card = container.querySelector('.todo-card');
      expect(card).not.toHaveClass('overdue');
      expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
    });

    it('should NOT display overdue styling for future todo', () => {
      const futureTodo = { ...mockTodo, dueDate: '2026-02-05', completed: 0 };
      const { container } = render(<TodoCard todo={futureTodo} {...mockHandlers} isLoading={false} />);
      
      const card = container.querySelector('.todo-card');
      expect(card).not.toHaveClass('overdue');
      expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
    });

    it('should NOT display overdue styling for completed past todo', () => {
      const completedOverdueTodo = { ...mockTodo, dueDate: '2026-02-03', completed: 1 };
      const { container } = render(<TodoCard todo={completedOverdueTodo} {...mockHandlers} isLoading={false} />);
      
      const card = container.querySelector('.todo-card');
      expect(card).not.toHaveClass('overdue');
      expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
    });

    it('should NOT display overdue styling for todo without due date', () => {
      const noDateTodo = { ...mockTodo, dueDate: null, completed: 0 };
      const { container } = render(<TodoCard todo={noDateTodo} {...mockHandlers} isLoading={false} />);
      
      const card = container.querySelector('.todo-card');
      expect(card).not.toHaveClass('overdue');
      expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
    });

    it('should remove overdue styling when due date changed from past to future', () => {
      const overdueTodo = { ...mockTodo, dueDate: '2026-02-03', completed: 0 };
      const { container, rerender } = render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      // Initially overdue
      let card = container.querySelector('.todo-card');
      expect(card).toHaveClass('overdue');
      
      // Update to future date
      const updatedTodo = { ...overdueTodo, dueDate: '2026-02-10' };
      rerender(<TodoCard todo={updatedTodo} {...mockHandlers} isLoading={false} />);
      
      // No longer overdue
      card = container.querySelector('.todo-card');
      expect(card).not.toHaveClass('overdue');
      expect(screen.queryByLabelText('Overdue')).not.toBeInTheDocument();
    });
  });
});
