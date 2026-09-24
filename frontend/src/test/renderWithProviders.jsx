import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store/store';

export function renderWithProviders(ui, { preloadedState } = {}) {
  if (preloadedState) {
    // reset for test isolation by recreating slices via dispatched actions is
    // not generic; tests that need isolation use makeStore() instead.
  }
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

export default renderWithProviders;
