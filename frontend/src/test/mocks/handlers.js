import { http, HttpResponse } from 'msw';

const BASE = '/api/v1';

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'user@test.com' && body.password === 'pass1234') {
      return HttpResponse.json({
        token: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: { id: 1, name: 'Test User', role: 'warehouse', permissions: ['inventory:view'] },
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.get(`${BASE}/auth/me`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (auth !== 'Bearer test-access-token') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({ id: 1, name: 'Test User', role: 'warehouse' });
  }),

  http.post(`${BASE}/auth/refresh`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    if (body.refreshToken === 'test-refresh-token') {
      return HttpResponse.json({
        token: 'rotated-access-token',
        refreshToken: 'rotated-refresh-token',
      });
    }
    return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
  }),

  http.get(`${BASE}/inventory/stock`, () =>
    HttpResponse.json([
      { id: 1, sku: 'BEAN-001', productName: 'Arabica Beans', quantity: 120, warehouseId: 1 },
      { id: 2, sku: 'BEAN-002', productName: 'Robusta Beans', quantity: 45, warehouseId: 1 },
    ])
  ),

  http.post(`${BASE}/inventory/receipts`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, ...body, status: 'pending_acceptance' }, { status: 201 });
  }),

  http.post(`${BASE}/inventory/transfers`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 77, ...body, status: 'in_transit' }, { status: 201 });
  }),
];
