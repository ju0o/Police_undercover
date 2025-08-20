import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EmptyState } from '../EmptyState';

// EmptyState 컴포넌트를 Router로 감싸는 헬퍼
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EmptyState', () => {
  it('renders basic empty state correctly', () => {
    renderWithRouter(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('📄')).toBeInTheDocument(); // default icon
  });

  it('renders custom icon', () => {
    renderWithRouter(
      <EmptyState
        icon="🔍"
        title="Search Empty"
      />
    );

    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('renders action button with href', () => {
    renderWithRouter(
      <EmptyState
        title="Test"
        action={{
          label: "Go Home",
          href: "/"
        }}
      />
    );

    const actionButton = screen.getByText('Go Home');
    expect(actionButton).toBeInTheDocument();
    expect(actionButton.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders action button with onClick', () => {
    const mockClick = jest.fn();
    
    renderWithRouter(
      <EmptyState
        title="Test"
        action={{
          label: "Click Me",
          onClick: mockClick
        }}
      />
    );

    const actionButton = screen.getByText('Click Me');
    fireEvent.click(actionButton);
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('renders children content', () => {
    renderWithRouter(
      <EmptyState title="Test">
        <div>Custom Content</div>
      </EmptyState>
    );

    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    renderWithRouter(<EmptyState title="Only Title" />);

    expect(screen.getByText('Only Title')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });
});
