import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="커스텀 로딩 메시지" />);
    
    expect(screen.getByText('커스텀 로딩 메시지')).toBeInTheDocument();
    expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    let spinner = document.querySelector('div[style*="width: 20px"]');
    expect(spinner).toBeInTheDocument();

    rerender(<LoadingSpinner size="medium" />);
    spinner = document.querySelector('div[style*="width: 32px"]');
    expect(spinner).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    spinner = document.querySelector('div[style*="width: 48px"]');
    expect(spinner).toBeInTheDocument();
  });

  it('does not render message when empty string provided', () => {
    render(<LoadingSpinner message="" />);
    
    expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
  });

  it('includes spin animation styles', () => {
    render(<LoadingSpinner />);
    
    const styleElement = document.querySelector('style');
    expect(styleElement?.textContent).toContain('@keyframes spin');
    expect(styleElement?.textContent).toContain('transform: rotate(360deg)');
  });
});
