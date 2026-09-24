import { describe, it, expect, beforeEach } from 'vitest';
import reducer, { loginStart, loginSuccess, loginFailure, logout, updateUser, clearError } from '../authSlice';

beforeEach(() => localStorage.clear());

describe('authSlice', () => {
  it('loginSuccess stores token/user and persists to localStorage', () => {
    const state = reducer(undefined, loginSuccess({ token: 't', refreshToken: 'r', user: { id: 1 } }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('t');
    expect(localStorage.getItem('token')).toBe('t');
    expect(JSON.parse(localStorage.getItem('user')).id).toBe(1);
  });

  it('logout clears state and storage', () => {
    let state = reducer(undefined, loginSuccess({ token: 't', user: { id: 1 } }));
    state = reducer(state, logout());
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('loginStart/loginFailure/clearError manage transient state', () => {
    let state = reducer(undefined, loginStart());
    expect(state.loading).toBe(true);
    state = reducer(state, loginFailure('bad creds'));
    expect(state.loading).toBe(false);
    expect(state.error).toBe('bad creds');
    state = reducer(state, clearError());
    expect(state.error).toBeNull();
  });

  it('updateUser merges fields', () => {
    let state = reducer(undefined, loginSuccess({ token: 't', user: { id: 1, name: 'A' } }));
    state = reducer(state, updateUser({ name: 'B' }));
    expect(state.user).toEqual({ id: 1, name: 'B' });
  });
});
