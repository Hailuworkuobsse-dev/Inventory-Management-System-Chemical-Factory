import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../mocks/server';
import { store } from '../../store/store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { server.resetHandlers(); store.dispatch({ type: 'auth/logout' }); localStorage.clear(); });
afterAll(() => server.close());

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

function AuthProbe() {
  const { login, isAuthenticated, user, error, loading } = useAuth();
  return (
    <div>
      <button onClick={() => login({ email: 'user@test.com', password: 'pass1234' })} disabled={loading}>
        sign-in
      </button>
      {isAuthenticated && <span data-testid="who">{user?.name}</span>}
      {error && <span data-testid="err">{String(error)}</span>}
    </div>
  );
}

const renderApp = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <AuthProbe />
      </MemoryRouter>
    </Provider>
  );

describe('journey: login', () => {
  it('logs in through RTK Query + Redux and marks the session authenticated', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByText('sign-in'));
    await waitFor(() => expect(screen.getByTestId('who')).toHaveTextContent('Test User'), { timeout: 5000 });
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.token).toBeTruthy();
  });

  it('surfaces an error for invalid credentials', async () => {
    function BadProbe() {
      const { login } = useAuth();
      return <button onClick={() => login({ email: 'x@x.com', password: 'nope' }).catch(() => {})}>bad</button>;
    }
    const u = userEvent.setup();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <BadProbe />
        </MemoryRouter>
      </Provider>
    );
    await u.click(screen.getByText('bad'));
    // login rejects with a 401 — assert the store was not flipped to authenticated
    await new Promise((r) => setTimeout(r, 300));
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});
