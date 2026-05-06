# Frontend Folder & File Organization – AIMS

A production‑ready, modular frontend that fully supports the 90 functional requirements, the API contract, and the technical specification. The structure is scalable, testable, and aligned with the chosen stack: **React 19, Vite 6, Redux Toolkit, RTK Query, Tailwind CSS, and PWA**.

---

## Root Directory

```
frontend/
├── public/                        # Static assets (favicon, manifest, robots.txt)
├── src/                           # Application source
│   ├── assets/                    # Images, icons, fonts
│   ├── components/                # Shared UI components
│   ├── config/                    # App configuration constants
│   ├── features/                  # Feature modules (business domains)
│   ├── hooks/                     # Shared custom hooks
│   ├── layouts/                   # Page layout components
│   ├── lib/                       # Third‑party library wrappers
│   ├── routes/                    # Route definitions & guards
│   ├── services/                  # Axios instance, socket, external API calls
│   ├── store/                     # Redux store, slices, RTK Query API
│   ├── styles/                    # Global Tailwind CSS, theme
│   ├── utils/                     # Pure helper functions
│   ├── App.jsx                    # Root component with providers
│   ├── main.jsx                  # Entry point, PWA registration
│   └── service-worker.js         # (optional) custom SW logic
├── index.html
├── package.json
├── vite.config.js                 # Vite + PWA plugin config
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
└── tsconfig.json                  # if using TypeScript (recommended)
```

---

## Detailed `src/` Breakdown

### 1. `assets/`
- `images/` – logos, empty state illustrations.
- `icons/` – SVG icons used in sidebar and components.

### 2. `components/` – Shared Presentational Components
Reusable building blocks used across feature modules.

| Component              | Purpose |
|------------------------|---------|
| `DataTable`            | Paginated, sortable, filterable table with export. |
| `StatusBadge`          | Coloured badge for batch/order/PO status. |
| `ConfirmDialog`        | Modal for destructive actions (recall, disposal). |
| `ScanInput`            | Text field with camera‑barcode trigger. |
| `DateRangePicker`      | For reports and filtering. |
| `AuditTimeline`        | Read‑only timeline of audit events. |
| `StockGauge`           | Visual stock level against min/max. |
| `ExpiryCountdown`      | Shows days until expiry with colour. |
| `EmptyState`           | Placeholder for empty data. |
| `ErrorBoundary`        | Catches rendering errors. |
| `LoadingSpinner`       | Centered spinner. |
| `NotificationBell`     | Badge with unread count, dropdown. |
| `Breadcrumb`           | Dynamic breadcrumb trail. |
| `SidebarItem`          | Single navigation item with icon. |
| `UserAvatar`           | User initial/picture dropdown. |

### 3. `config/`
- `index.js` – exports app constants: `API_BASE_URL`, `APP_NAME`, `TOKEN_REFRESH_MARGIN`, `FALLBACK_WAREHOUSE_ID`, etc.
- `permissions.js` – maps permission strings to UI actions (e.g., `CAN_RELEASE_QUARANTINE`).
- `navigation.js` – sidebar menu structure, each item includes required permission.

### 4. `features/` – Feature Modules
Each business domain lives in its own folder and may contain sub‑folders:  
`pages/` – top‑level route components.  
`components/` – domain‑specific components.  
`hooks/` – custom hooks (often RTK Query wrappers).  
`api/` – optional RTK Query endpoints specific to the module (or all in a central `store/api` – both approaches are valid; centralised is used here for simplicity).

**Module List:**
```
features/
├── auth/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   └── UnauthorizedPage.jsx
│   ├── components/
│   │   └── LoginForm.jsx
│   └── hooks/
│       └── useAuth.js            # wraps login/refresh logic
├── dashboard/
│   ├── pages/
│   │   └── DashboardPage.jsx     # role‑based widget container
│   └── components/
│       ├── widgets/
│       │   ├── StockValueCard.jsx
│       │   ├── StockOutRiskList.jsx
│       │   ├── ExpiryTimelineChart.jsx
│       │   └── RecentTransactions.jsx
│       └── DashboardGrid.jsx     # responsive grid layout
├── inventory/
│   ├── pages/
│   │   ├── StockListPage.jsx
│   │   ├── StockDetailPage.jsx
│   │   ├── ReceiptListPage.jsx
│   │   ├── ReceiptCreatePage.jsx
│   │   ├── TransferPage.jsx
│   │   └── AdjustmentPage.jsx
│   └── components/
│       ├── StockTable.jsx
│       ├── StockDetailCard.jsx
│       ├── ReceiptForm.jsx
│       ├── ReceiptItemsAccept.jsx
│       ├── TransferForm.jsx
│       ├── AdjustmentForm.jsx
│       └── BinSelectorModal.jsx
├── quality/
│   ├── pages/
│   │   ├── BatchListPage.jsx
│   │   ├── BatchDetailPage.jsx
│   │   ├── LabTestPage.jsx
│   │   ├── RecallPage.jsx
│   │   └── EudrPage.jsx
│   └── components/
│       ├── BatchTable.jsx
│       ├── TraceabilityChain.jsx
│       ├── LabTestForm.jsx
│       ├── CertificateList.jsx
│       └── RecallInitiateDialog.jsx
├── procurement/
│   ├── pages/
│   │   ├── SupplierListPage.jsx
│   │   ├── SupplierDetailPage.jsx
│   │   ├── PurchaseOrderListPage.jsx
│   │   ├── PurchaseOrderCreatePage.jsx
│   │   └── ForexPage.jsx
│   └── components/
│       ├── SupplierForm.jsx
│       ├── SupplierScorecard.jsx
│       ├── POForm.jsx
│       └── ForexAllocationDialog.jsx
├── sales/
│   ├── pages/
│   │   ├── OrderListPage.jsx
│   │   ├── OrderCreatePage.jsx
│   │   ├── OrderDetailPage.jsx
│   │   ├── ReturnListPage.jsx
│   │   └── CustomerPortalPage.jsx
│   └── components/
│       ├── OrderForm.jsx
│       ├── PickListWidget.jsx
│       ├── ReturnForm.jsx
│       └── ShipmentTracker.jsx
├── production/
│   ├── pages/
│   │   ├── BomListPage.jsx
│   │   ├── BomCreatePage.jsx
│   │   ├── WorkOrderListPage.jsx
│   │   └── WorkOrderDetailPage.jsx
│   └── components/
│       ├── BomForm.jsx
│       ├── MaterialAvailabilityGauge.jsx
│       ├── MaterialConsumptionForm.jsx
│       └── YieldChart.jsx
├── reports/
│   ├── pages/
│   │   ├── InventoryTurnoverPage.jsx
│   │   ├── AbcAnalysisPage.jsx
│   │   ├── SlowMoversPage.jsx
│   │   ├── ExpiryRiskPage.jsx
│   │   ├── StockOutRiskPage.jsx
│   │   └── DemandForecastPage.jsx
│   └── components/
│       ├── ReportFilterBar.jsx
│       └── ExportButtons.jsx
├── compliance/
│   ├── pages/
│   │   ├── ErisExportPage.jsx
│   │   ├── TaxExportPage.jsx
│   │   └── AuditReportPage.jsx
│   └── components/
│       └── ExportConfigForm.jsx
├── iot/
│   ├── pages/
│   │   └── IotDashboardPage.jsx
│   └── components/
│       ├── TemperatureGraph.jsx
│       ├── ExcursionAlertList.jsx
│       └── SensorList.jsx
└── admin/
    ├── pages/
    │   ├── UserManagementPage.jsx
    │   ├── RoleManagementPage.jsx
    │   └── SystemSettingsPage.jsx
    └── components/
        ├── UserForm.jsx
        ├── RoleForm.jsx
        └── PermissionMatrix.jsx
```

### 5. `hooks/` – Shared Custom Hooks
- `useAuth.js` – returns current user, roles, login/logout functions.
- `usePermission.js` – checks if user has a specific permission.
- `useOnlineStatus.js` – monitors network connectivity.
- `useBarcodeScanner.js` – wraps `html5-qrcode`, returns scanned data.
- `useDebounce.js` – for search inputs.
- `usePagination.js` – standard pagination state.

### 6. `layouts/`
- `AppLayout.jsx` – sidebar, topbar, `Outlet`. Handles role‑based sidebar items and warehouse selector.
- `AuthLayout.jsx` – minimal layout for login page.
- `EmptyLayout.jsx` – for full‑page reports if needed.

### 7. `lib/` – Library Wrappers
- `axios.js` – configured Axios instance with baseURL, interceptors for JWT (attach from Redux) and refresh token flow.
- `socket.js` – Socket.io client instance, connects after authentication, exports event hooks.
- `idb.js` – IndexedDB helpers for offline queue (`addToQueue`, `getQueue`, `clearQueue`).
- `barcode.js` – initialises and exports the barcode scanner module.

### 8. `routes/`
- `index.jsx` – defines the router tree with `createBrowserRouter`.
- `ProtectedRoute.jsx` – checks authentication, wraps `AppLayout`; redirects to login if not authenticated.
- `RoleGuard.jsx` – higher‑order component that checks permission for a route.
- `routeConfig.js` – array of route objects (path, element, permissions, lazy loaded pages).

Example route configuration (lazy imports):
```jsx
const StockListPage = lazy(() => import('../features/inventory/pages/StockListPage'));
// inside route definition:
{
  path: 'inventory/stock',
  element: <RoleGuard permission="INVENTORY_READ"><StockListPage /></RoleGuard>,
}
```

### 9. `services/` – API Interaction Layer (RTK Query)
We store the centralised RTK Query API slice here (or inside `store/api`). This folder contains the base API definition with all endpoints.

- `apiSlice.js` – `createApi` with `baseQuery` using the custom Axios instance, tag types for cache invalidation (e.g., `Stock`, `Batch`, `PO`, `User`).
- `endpoints/` (optional) – separate files for large groups (inventory, procurement, quality) that inject endpoints into `apiSlice`.
  - `inventoryEndpoints.js`
  - `qualityEndpoints.js`
  - `procurementEndpoints.js`
  - etc.

This centralised approach allows automatic cache invalidation across features.

### 10. `store/`
Redux store configuration.

- `store.js` – configures the store with `apiSlice` middleware, auth reducer, UI reducer.
- `slices/`
  - `authSlice.js` – user object, access token (stored in memory, not persisted), roles.
  - `uiSlice.js` – sidebar collapsed, theme, selected warehouse, scan mode.
  - `offlineQueueSlice.js` – transaction queue state (pending operations), sync status.
- `hooks.js` – re‑exports typed `useDispatch`, `useSelector`, and RTK Query hooks.

### 11. `styles/`
- `globals.css` – Tailwind directives (`@tailwind base`, etc.), custom base styles.
- `theme.js` – (if using Tailwind config) extends colours, fonts. Usually in `tailwind.config.js`.

### 12. `utils/`
- `formatDate.js` – Ethiopian date formatting support (Gregorian and Ethiopian calendar).
- `currency.js` – formats ETB values.
- `validators.js` – reusable form validation schemas (powered by Zod or Yup).
- `permissions.js` – pure function to check if a list of user permissions includes required ones.
- `offlineSync.js` – logic to replay queued transactions via API.

### 13. Root Files
- `App.jsx` – sets up providers: Redux `<Provider>`, Router `<RouterProvider>`, error boundary, suspense fallback.
- `main.jsx` – mounts `App`, registers service worker for PWA (using `vite-plugin-pwa` virtual module).

---

## PWA & Offline Entry Points

- **Service Worker:** handled by `vite-plugin-pwa`; custom worker logic can be in `src/service-worker.js` if needed (e.g., caching API responses).
- **Offline Queue:** managed via Redux slice and IndexedDB. The `services/apiSlice.js` can use a custom `baseQuery` that, when offline, queues mutations instead of network call.
- **Manifest:** auto‑generated by Vite‑PWA from config; icons placed in `public/`.

---

## Testing Structure (not detailed but included)

```
src/__tests__/                 # co‑located or separate
├── components/
├── features/
├── hooks/
├── store/
└── utils/
```
- Unit tests with Vitest + React Testing Library.
- Integration tests with Cypress or Playwright (in `/e2e` at root).

---

## How This Structure Satisfies the Requirements

- **Modularity:** Each feature (inventory, quality, procurement) is isolated – aligns with FR‑033 (multi‑warehouse stock visibility), FR‑011 (FEFO), etc.
- **Reusability:** Shared components like `DataTable`, `ScanInput` are used across pages, e.g., picking scan (FR‑075), receipt scan (FR‑009).
- **Role‑based UI:** `RoleGuard` and permission hooks hide/show actions based on user roles (FR‑067–FR‑074).
- **Real‑time:** `lib/socket.js` integrates with RTK Query to update dashboard widgets (FR‑012, FR‑061).
- **Offline:** PWA support and IndexedDB queue allow warehouse operators to continue scanning even during connectivity loss (FR‑079).
- **Dashboard Role Variants:** The `DashboardPage` renders different widget sets based on `useAuth().user.roles`, fulfilling the role‑specific dashboards defined in the UI spec.

---

This folder structure provides a clean, maintainable, and scalable foundation. It aligns with the backend separation of concerns and can be directly implemented by a full‑stack team.
