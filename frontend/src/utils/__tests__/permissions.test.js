import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  getAllRolePermissions,
  hasRole,
  hasAnyRole,
  filterMenuByPermission,
  createPermissionChecker,
  getActionLabel,
  PERMISSIONS,
} from '../permissions';

describe('permission utilities', () => {
  it('hasPermission matches exact permission strings', () => {
    const perms = [PERMISSIONS.INVENTORY_READ, 'inventory:write'];
    expect(hasPermission(perms, PERMISSIONS.INVENTORY_READ)).toBe(true);
    expect(hasPermission(perms, PERMISSIONS.ADMIN_USERS)).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
  });

  it('hasAnyPermission / hasAllPermissions', () => {
    const perms = ['a:read', 'b:read'];
    expect(hasAnyPermission(perms, ['a:read', 'zzz'])).toBe(true);
    expect(hasAnyPermission(perms, ['nope'])).toBe(false);
    expect(hasAllPermissions(perms, ['a:read', 'b:read'])).toBe(true);
    expect(hasAllPermissions(perms, ['a:read', 'c:read'])).toBe(false);
  });

  it('getRolePermissions returns arrays and empty for unknown roles', () => {
    for (const r of ['admin', 'warehouse_manager', 'quality_officer']) {
      expect(Array.isArray(getRolePermissions(r))).toBe(true);
    }
    expect(getRolePermissions('does-not-exist')).toEqual([]);
    expect(getRolePermissions(null)).toEqual([]);
  });

  it('getAllRolePermissions unions multiple roles without duplicates', () => {
    const combined = getAllRolePermissions(['admin', 'warehouse_manager']);
    expect(combined.length).toBeGreaterThan(0);
    expect(new Set(combined).size).toBe(combined.length);
    expect(getAllRolePermissions(null)).toEqual([]);
  });

  it('hasRole / hasAnyRole handle role lists', () => {
    expect(hasRole(['warehouse_manager'], 'warehouse_manager')).toBe(true);
    expect(hasRole('not-an-array', 'x')).toBe(false);
    expect(hasAnyRole(['viewer'], ['admin', 'viewer'])).toBe(true);
    expect(hasAnyRole(['viewer'], ['admin'])).toBe(false);
  });

  it('filterMenuByPermission keeps only allowed items and recurses children', () => {
    const menu = [
      { label: 'Stock', permission: 'inventory:read' },
      { label: 'Admin', permission: 'admin:users' },
      {
        label: 'Ops',
        children: [
          { label: 'Receiving', permission: 'inventory:read' },
          { label: 'Secret', permission: 'admin:settings' },
        ],
      },
    ];
    const filtered = filterMenuByPermission(menu, ['inventory:read']);
    expect(filtered.map((m) => m.label)).toContain('Stock');
    expect(filtered.map((m) => m.label)).not.toContain('Admin');
    // items without a permission requirement stay visible
    expect(filterMenuByPermission([{ label: 'Public' }], []).map((m) => m.label)).toEqual(['Public']);
    // array permissions use any-of semantics
    expect(filterMenuByPermission([{ label: 'X', permission: ['a', 'b'] }], ['b'])).toHaveLength(1);
  });

  it('createPermissionChecker produces a bound checker object', () => {
    const checker = createPermissionChecker(['inventory:read']);
    expect(checker.can('inventory:read')).toBe(true);
    expect(checker.can('inventory:delete')).toBe(false);
    expect(checker.canAny(['nope', 'inventory:read'])).toBe(true);
    expect(checker.canAll(['inventory:read'])).toBe(true);
    expect(checker.cannot('inventory:delete')).toBe(true);
  });

  it('getActionLabel returns allowed/denied labels', () => {
    const label = (perms) => getActionLabel(perms, { permission: 'inventory:read', allowedLabel: 'Open', deniedLabel: 'Locked' });
    expect(label(['inventory:read'])).toBe('Open');
    expect(label([])).toBe('Locked');
  });
});
