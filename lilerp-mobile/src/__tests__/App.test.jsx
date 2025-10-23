import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Wrapper component with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock successful fetch responses
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 1, name: 'Test' }, token: 'test-token' }),
    });
  });

  it('renders splash screen with LILERP branding', () => {
    renderWithRouter(<App />);
    
    // Verify splash screen elements
    expect(screen.getByText('LILERP')).toBeInTheDocument();
    expect(screen.getByText(/Liberia Integrated Land Registry/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Response Platform/i)).toBeInTheDocument();
  });

  it('has proper app structure', () => {
    renderWithRouter(<App />);
    
    // Verify the app renders without crashing
    const container = screen.getByText('LILERP').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('initializes with localStorage cleared for testing', () => {
    renderWithRouter(<App />);
    
    // Verify localStorage is empty (logged out state)
    expect(localStorage.getItem('lilerp_user')).toBeNull();
    expect(localStorage.getItem('lilerp_token')).toBeNull();
  });
});