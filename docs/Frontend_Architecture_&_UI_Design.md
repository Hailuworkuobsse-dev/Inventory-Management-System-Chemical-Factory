# Frontend Architecture & UI Design – AIMS  
**Advanced Inventory Management System**  
*Version 1.0 | React + Vite + Redux Toolkit + Axios*

This document defines the complete frontend structure, pages, components, dashboards, and user flows to satisfy all 90 functional requirements (FR‑001 to FR‑090). The frontend is a Progressive Web Application (PWA) that works on desktop browsers and mobile devices with offline capabilities.

---

## 1. Overall Architecture

**Type:** Single-Page Application (SPA) with lazy‑loaded feature modules.  
**Routing:** React Router v6 with role‑based guards.  
**State Management:** Redux Toolkit (RTK) + RTK Query for data fetching & caching.  
**Styling:** Tailwind CSS for utility‑first responsive design, with a shared component library (shadcn/ui or custom).  
**PWA:** Vite‑PWA plugin with Workbox, offline cache of critical assets and IndexedDB for transaction queue.  
**Barcode/QR:** `@zxing/library` or `html5-qrcode` for camera‑based scanning.  
**Real‑time:** Socket.io client for live alerts, cold‑chain excursions, and dashboard updates.

The app is modular, each business domain (inventory, procurement, quality, etc.) is a feature folder with its own pages, components, and Redux slices.

---

## 2. Global Layout & Components

### Shell Layout (`AppLayout.jsx`)
- **Sidebar Navigation** (collapsible, role‑filtered)  
  Links to each module's main page based on user permissions.
- **Topbar:** User profile, notification bell (with badge), warehouse selector (if multi‑warehouse scope).
- **Main Content Area:** Renders nested routes.
- **Footer:** Minimal, with AIMS version.

### Global Reusable Components
| Component         | Purpose |
|-------------------|---------|
| `DataTable`       | Paginated, sortable, filterable table with export (CSV/Excel). |
| `StatusBadge`     | Render coloured badges for batch/order/PO statuses. |
| `ConfirmDialog`   | Confirmation modal for destructive actions (recall, disposal). |
| `ScanInput`       | Text input with a camera icon that opens barcode scanner. |
| `DateRangePicker` | For reports and filtering. |
| `AuditLogViewer`   | Read‑only timeline component for any entity's audit trail. |
| `StockIndicator`   | Visual gauge showing current stock vs safety/min/max levels. |
| `ExpiryCountdownDay`| Shows days until expiry with colour coding. |
| `EmptyState`      | Placeholder when no data exists. |
| `ErrorBoundary`   | Catches rendering errors. |

---

## 3. Landing Page & Authentication

### Route: `/`
- **Public landing page** (before login) – AIMS branding, Ethiopian context messaging (EFDA compliant, Forex‑optimized, etc.), login form.
- **Login form:** Email, password, "Remember me", submit. Links to "Forgot password".
- After successful login, redirect to the appropriate dashboard based on role.

### Route: `/unauthorized`
- Shown when user lacks permission for a page.

---

## 4. Role‑Based Dashboards

Each role sees a custom dashboard as the default view after login, pulling data from `/api/v1/dashboards/executive`.

| Role                | Dashboard Widgets |
|---------------------|--------------------|
| **Admin**           | System health, active users, recent audit logs, critical alerts (stock‑outs, expiry), quick‑links to user management. |
| **Warehouse Manager** | Stock value snapshot, FEFO compliance %, pending receipts, order fulfilment speed, shrinkage this month. |
| **Quality Officer**   | Quarantined batches count, pending lab tests, soon‑to‑expire batches (30/60/90 days), recall log, temperature excursions. |
| **Procurement Manager** | Low stock warnings, pending POs, forex allocation usage, lead time trends, supplier performance summary. |
| **Production Manager** | Active work orders, WIP value, BOM yield variance, material stock availability for planned orders. |
| **Read‑only / Auditor** | Dashboard with key metrics but no actions; focused on reports and traceability. |
| **Pharmacy/Wholesaler Portal (external user)** | Simplified: available stock (own customer portal), order status, returns. (FR‑086) |

**Common Widgets used across dashboards:**
- `KPI Card` (e.g., Total Stock Value, Days of Cover)
- `Stock‑out Risk Alert List`
- `Expiry Timeline Chart`
- `Recent Transactions List` (receipts, picks)
- `Temperature Excursion Map` (if IoT enabled)

---

## 5. Feature Modules – Pages & Internal Components

Each feature module is under `src/features/` and follows the same pattern:  
`pages/` – main route‑mapped views.  
`components/` – module‑specific reusable components.  
`hooks/` – custom hooks for API calls via RTK Query.  
`slice/` (optional) – any non‑API Redux state.

Below is a detailed breakdown of each module, its pages, and key components.

---

### 5.1 Inventory & Warehouse Module  
**Base route:** `/inventory`

| Page Route                   | Description                         | Key Components / Layout                          | FRs Addressed |
|------------------------------|-------------------------------------|--------------------------------------------------|---------------|
| `/inventory/stock`           | Stock list/search (multi‑warehouse) | `StockDataTable` (FEFO‑sorted data), filters: product, batch, expiry range, zone. Each row: expandable to see bin locations and reserved qty. | FR‑011, FR‑033, FR‑053 |
| `/inventory/stock/:stockId`  | Stock detail (drill‑down)           | `StockDetailCard`, `AuditLogViewer`, `BatchInfo`, `BinLocationMap`, `ReservationHistory`. | FR‑001, FR‑019 |
| `/inventory/receipts`        | Goods receipt list & create new     | `ReceiptList`, `ReceiptForm` (scan‑friendly, batch number, import permit validation). On submit, leads to acceptance flow. | FR‑009, FR‑029 |
| `/inventory/receipts/:id`    | Receipt detail & acceptance         | `ReceiptItemsTable` with "Accept/Reject" actions, quarantine triggers. | FR‑014, FR‑030 |
| `/inventory/transfers`       | Inter‑warehouse/inter‑bin transfers | `TransferForm` (from stock/bin to destination), `TransferList`. | FR‑036 |
| `/inventory/adjustments`     | Manual inventory adjustments        | `AdjustmentForm` with reason tracking, cycle‑count integration. | FR‑054 |
| `/inventory/disposals`       | Dispose expired/damaged goods       | `DisposalForm` with disposal method codes. | FR‑065 |

**Shared Module Components:**
- `BinSelector` – tree or grid picker for bin location.
- `FEFOOrderedList` – auto‑sorted list of batches for picking.

---

### 5.2 Quality & Batch Management  
**Base route:** `/quality`

| Page Route                     | Description                       | Key Components                                    | FRs Addressed |
|--------------------------------|-----------------------------------|---------------------------------------------------|---------------|
| `/quality/batches`             | Batch list with filters           | `BatchDataTable` (status, product, expiry) with quick actions: quarantine, release, recall. | FR‑013, FR‑014, FR‑005 |
| `/quality/batches/:id`         | Batch detailed view               | `TraceabilityChain` (full forward/backward graph), `LabTestsTable`, `CertificatesList`, `RecallButton`. | FR‑001, FR‑005, FR‑007 |
| `/quality/lab-tests`           | Pending & completed lab tests     | `LabTestQueue`, `LabTestForm` (enter results). | FR‑020 |
| `/quality/quarantine`          | Currently quarantined items       | `QuarantineList` with release action. | FR‑014 |
| `/quality/eu-dr`               | EUDR document management          | `EudrDocumentList` for exported crops, upload certificates. | FR‑003 |
| `/quality/recalls`             | Active and historical recalls     | `RecallList` with affected locations map. | FR‑005 |

**Shared Module Components:**
- `CertificateCard` – displays file link, validity.
- `BatchStatusTimeline` – visual timeline from receipt to sale/disposal.
- `LabTestResultBadge` – PASS/FAIL.

---

### 5.3 Procurement & Forex  
**Base route:** `/procurement`

| Page Route                     | Description                     | Key Components                                 | FRs Addressed |
|--------------------------------|---------------------------------|------------------------------------------------|---------------|
| `/procurement/suppliers`       | Supplier list & management      | `SupplierTable`, `SupplierForm` (with certificate expiry dates). | FR‑007, FR‑035, FR‑064 |
| `/procurement/suppliers/:id`   | Supplier detail                 | `SupplierScorecard`, `RejectionLogList`. | FR‑035 |
| `/procurement/purchase-orders` | PO list                         | `POList` with status badges, forex required flag. | FR‑025 |
| `/procurement/purchase-orders/create` | Create new PO             | `POForm` – line items, LC selection, currency. Auto‑calculate total in ETB using forex rate. | FR‑025 |
| `/procurement/purchase-orders/:id` | PO detail & actions          | `POItemsTable`, `AllocateForexButton` (opens dialog), `ReceiptButton` (link to receive). | FR‑021 |
| `/procurement/forex`           | Forex rate list & allocation    | `ForexRateTable`, `ForexAllocationModal`. Show stock‑out risk prioritised list for forex allocation. | FR‑021, FR‑029 |

**Shared Components:**
- `ForexConverter` – displays ETB equivalent using latest rate.
- `StockOutRiskIndicator` – red/yellow/green based on inventory coverage.
- `LCStatusBadge` – valid/expiring/expired.

---

### 5.4 Sales & Distribution  
**Base route:** `/sales`

| Page Route                | Description                     | Key Components                              | FRs Addressed |
|---------------------------|---------------------------------|---------------------------------------------|---------------|
| `/sales/orders`           | Sales order list                | `SalesOrderTable` (status, customer). | FR‑039 |
| `/sales/orders/create`    | New sales order                 | `SalesOrderForm` – selects product, suggests available stock (FEFO), shows customer portal if external user. | FR‑039, FR‑086 |
| `/sales/orders/:id`       | Order detail & picking/shipping | `OrderDetail`, pick list, pack verification (scan items), delivery status. | FR‑085, FR‑075 |
| `/sales/returns`          | Return list                     | `ReturnList` | FR‑040 |
| `/sales/returns/create`   | Log a return                    | `ReturnForm` with reason codes. | FR‑040 |
| `/sales/customers`        | Customer list (if internal)     | `CustomerTable` | FR‑086 |

**Shared Components:**
- `PickListWidget` – step‑by‑step picking guidance with bin location and scan verification.
- `ShipmentTracker` – shows last‑mile delivery updates.

---

### 5.5 Production & BOM  
**Base route:** `/production`

| Page Route               | Description              | Key Components                       | FRs Addressed |
|--------------------------|--------------------------|--------------------------------------|---------------|
| `/production/boms`       | BOM list                 | `BOMTable`, `BOMVersionHistory`. | FR‑045 |
| `/production/boms/create`| New BOM                  | `BOMForm` – drag‑drop components, set quantities, scrap factor. | FR‑041 |
| `/production/work-orders`| Work order list          | `WorkOrderTable` with status. | FR‑042 |
| `/production/work-orders/create` | New work order   | `WorkOrderForm` – selects active BOM, output quantity, auto‑checks material availability. | FR‑044 |
| `/production/work-orders/:id` | Work order execution | `MaterialConsumptionForm` (scan raw materials), `OutputBatchForm`, `YieldAnalysis`. | FR‑043, FR‑041 |

**Shared Components:**
- `MaterialAvailabilityGauge` – visual indicator if all materials are in stock.
- `YieldChart` – comparison of planned vs actual output.

---

### 5.6 Reports & Dashboards  
**Base route:** `/reports` (Admin, Manager roles mostly)

| Page Route                     | Description                     | Components / Visualisation | FRs |
|--------------------------------|---------------------------------|----------------------------|-----|
| `/reports/inventory-turnover`  | Turnover ratios                 | Table + bar chart.         | FR‑053 |
| `/reports/abc-analysis`        | ABC classification              | Pie chart, drill‑down.     | FR‑052 |
| `/reports/slow-movers`         | Slow‑moving items               | Table with suggestion actions (discount, transfer). | FR‑024 |
| `/reports/expiry-nearing`      | Expiry risk dashboard           | Filter by days (30/60/90), color‑coded grid. | FR‑013 |
| `/reports/stock-out-risk`      | Low stock & critical medicines  | Alerts list, zero‑tolerance flag for life‑saving drugs. | FR‑061 |
| `/reports/shrinkage`           | Inventory shrinkage analysis    | Comparison chart between system vs physical. | FR‑054 |
| `/reports/demand-forecast`     | Seasonality & demand sensing    | Line chart with historical data. | FR‑051 |
| `/reports/audit-logs`          | Full audit trail viewer         | `AuditLogViewer` with filters. | FR‑068, FR‑071 |

---

### 5.7 Compliance & Regulatory  
**Base route:** `/compliance`

| Page Route                   | Description                  | Components                             | FRs |
|------------------------------|------------------------------|----------------------------------------|-----|
| `/compliance/eris-export`    | Generate eRIS file           | `ErisExportForm` (select period, format). Download link. | FR‑002 |
| `/compliance/tax-export`     | Tax valuation export         | `TaxExportForm`. | FR‑010 |
| `/compliance/audit-reports`  | On‑demand inspection reports | `AuditReportGenerator` with parameters. | FR‑004 |
| `/compliance/import-permits` | Manage i‑import permits      | `PermitList`, `PermitForm` (if needed). | FR‑009 |

---

### 5.8 IoT Monitoring  
**Base route:** `/iot` (if sensor infrastructure exists)

| Page Route             | Components                              | FRs |
|------------------------|-----------------------------------------|-----|
| `/iot/dashboard`       | Real‑time temperature/humidity graphs per zone, excursion alerts. | FR‑012, FR‑016 |
| `/iot/sensors`         | Sensor list & configuration. | FR‑012 |

---

### 5.9 User Management & Security (Admin)  
**Base route:** `/admin`

| Page Route           | Components                                | FRs |
|----------------------|-------------------------------------------|-----|
| `/admin/users`       | `UserTable`, `UserForm` (assign roles, warehouse scope). | FR‑067 |
| `/admin/roles`       | `RoleTable`, `RoleForm` (permissions matrix). | FR‑067 |
| `/admin/permissions` | Read‑only permission list.                | FR‑067 |
| `/admin/audit-logs`  | Global audit log viewer (same as reports but admin). | FR‑068 |
| `/admin/settings`    | System parameters: default safety stock factors, lead time base, etc. | FR‑031 |

---

### 5.10 PWA & Mobile Specific Pages (overlays)
- **Off‑line sync status indicator** in topbar.
- **Barcode scan page** (modal or full‑screen) for picking, receiving, and cycle counting. Uses `html5-qrcode` with torch support.
- **Home screen shortcut** with AIMS icon.

---

## 6. Offline & PWA Strategy (FR‑075, FR‑079)

- **Service Worker** (via `vite-plugin-pwa`) pre‑caches the app shell and critical API endpoints for recent stock list.
- **IndexedDB** stores a queue of pending transactions (max 100) when network is lost: receipts, picks, adjustments. Each transaction is timestamped.
- On reconnection, a **"Sync"** button or automatic background sync replays the queue to the API.
- Conflict resolution: if API returns 409 (e.g., stock already consumed), the user is notified and asked to reconcile.
- **Camera‑based barcode scanning works offline** (library decodes locally), but transaction is queued if no network.

---

## 7. State Management & Data Flow

**Redux Toolkit Store:**
- **API slice** (via RTK Query): nearly all data fetching uses RTK Query endpoints, generated from `apiSlice.js` that defines all API tags (Stock, Batch, PO, etc.). This provides automatic caching, invalidation, and optimistic updates.
- **Auth slice:** stores user, roles, access token (in memory), and refresh token cookie status.
- **UI slice:** sidebar collapsed, theme, warehouse filter selection, scan mode toggles.
- **Offline queue slice:** manages the IndexedDB transaction queue, sync status.

**Data Flow:**
1. Page component mounts → dispatches RTK Query hook (e.g., `useGetStockQuery`).
2. Hook fetches data from API, caches it. If offline, returns stale cache.
3. Mutations (POST, PUT) → RTK Query automatically invalidates related tags, refetch data.
4. For real‑time, Socket.io client updates the relevant cache directly via RTK Query's `updateQueryData` or triggers a refetch.

---

## 8. UI/UX Design Principles (Aligned with FRs)

- **FEFO visual:** In stock lists, expiry date column with colour‑coding (red < 30 days, yellow < 90 days). Picking suggestions always sort by earliest expiry.
- **Error prevention:** Barcode scanning on picking: if wrong batch, loud vibration & error alert.
- **Accessibility:** WCAG 2.1 AA, keyboard navigable tables and forms.
- **Mobile‑first:** All lists become card views on small screens; forms stack vertically.
- **Role‑based visibility:** Buttons/actions only appear if user has the required permission (controlled via RBAC Redux selector).
- **Confirmations:** Destructive actions (recall, disposal) require dual confirmation or password.

---

## 9. Mapping of Major Pages to Functional Requirements (Sampled)

| FR  | Requirement Summary                     | Frontend Page(s) |
|-----|-----------------------------------------|------------------|
| 001 | Batch traceability raw material to end-user | Inventory > Stock detail, Quality > Batch detail (TraceabilityChain component) |
| 002 | eRIS Integration data exchange | Compliance > ERIS Export |
| 003 | EUDR deforestation‑free certificates | Quality > EU‑DR page, Batch detail |
| 004 | Instant inspection reports | Compliance > Audit Reports, or dashboard widget |
| 005 | Recall accuracy | Quality > Batch detail > Recall button, Quality > Recalls page |
| 006 | API consumption tracking | Production > Work order execution (material consumption) |
| 007 | Supplier certificate validity | Procurement > Suppliers list (certificate expiry highlight) |
| 008 | Controlled substances high‑security | Inventory > Stock, with restricted UI and dual approval dialogs |
| 009 | Import permit alignment | Inventory > Receipt create/edit, validation message |
| 010 | Tax valuation export | Compliance > Tax Export |
| 011 | FEFO enforcement | Inventory > Stock list (FEFO sorted), Picking workflow |
| 012 | Cold chain monitoring | IoT > Dashboard, Quality > Batch detail temp log |
| 013 | Expiry alerts (30/60/90) | Dashboard alerts, Quality > Batches filter, Reports > Expiry Nearing |
| 014 | Quarantine management | Inventory > Receipt acceptance, Quality > Batches (quarantine/release) |
| 015 | Hazardous segregation | Inventory > Stock placement (bin assignment rules enforced via API, UI shows zone type) |
| ... |                                         | |
| 061 | Stock‑out zero tolerance for life‑saving meds | Dashboard critical alert, Reports > Stock‑out risk, push notification |
| 083 | Blockchain event stream readiness | Quality > Batch detail, may show event log (read only) |
| 086 | Customer stock portal | Sales > Orders create (if customer portal user), own available stock view. |
| 088 | Export documentation pack | Compliance > Export docs generation, attached to shipment. |

---

## 10. Sample Wireframe Descriptions

### Dashboard (Warehouse Manager)
- Top row: three KPI cards (Total Stock Value ETB, Pending Receipts, FEFO Compliance %).
- Below left: "Expiring in 30 days" list (compact table with batch number, product, days).
- Below right: "Stock‑Out Risk" list with red indicators for items below safety stock.
- Bottom: Recent transactions timeline (last 24h receipts and picks).
- A "Take Action" button links to Picking or Receiving.

### Stock List Page
- Filter bar at top: SKU, product name, warehouse dropdown, zone type, expiry range.
- Table columns: SKU, Product, Batch, Expiry Date (colour‑coded), Warehouse, Bin, Available Qty, Reserved Qty, Status (Badge).
- Click row → expand to see detailed batch info and bin map.
- "Add Stock" (receipt) button, "Adjust" button.

### Batch Detail Page
- Header: Batch number, product, status badge.
- Section "Traceability": interactive graph from supplier through receipt, production, to sales/disposal.
- Section "Lab Tests": table of test results; button to add new.
- Section "Certificates": list of attached documents.
- Actions bar: Release (if quarantined), Recall (if released), Print label.

---

## 11. Technology Stack & Tooling (Frontend)

- **React 19** with TypeScript.
- **Vite 6** for development and build, with `vite-plugin-pwa`.
- **Redux Toolkit** + **RTK Query** for API state.
- **React Router v6** with `createBrowserRouter` and lazy loading.
- **Axios** for custom HTTP client with interceptors (JWT auto‑attach, refresh).
- **Tailwind CSS** + **Headless UI** or **Radix UI** for accessible primitive components.
- **Recharts** or **Nivo** for dashboards and charts.
- **html5-qrcode** / **@zxing/library** for barcode/QR scanning.
- **Workbox** for service worker caching strategies.
- **IndexedDB** (via `idb` library) for offline queue.
- **Socket.io‑client** for real‑time alerts.
- **react‑hook‑form** + **Zod** for form validation.

---

## 12. Component Hierarchy Example (Simplified)

```
App
├── AuthProvider
├── Router
│   ├── PublicRoutes
│   │   ├── LandingPage (login)
│   │   └── UnauthorizedPage
│   └── ProtectedRoutes (role‑guarded)
│       └── AppLayout
│           ├── Sidebar
│           ├── Topbar (UserMenu, NotificationBell, WarehouseSelector)
│           └── Outlet (feature pages)
│               ├── DashboardPage
│               ├── StockListPage
│               └── ...
```

---

## 13. Implementation Order

1. **Foundation:** App layout, auth flow, basic routing, RBAC.  
2. **Inventory Core:** Stock list/receipt, picking (FEFO), transfers.  
3. **Quality:** Batch management, lab tests, recalls.  
4. **Procurement:** POs, forex, suppliers.  
5. **Sales:** Orders, returns, customer portal.  
6. **Production:** BOM, work orders.  
7. **Reports & Dashboards:** Executive dashboards, standard reports.  
8. **IoT & Compliance:** eRIS export, IoT monitoring.  
9. **PWA & Offline:** Service worker, barcode scanning, offline queue.

---

This frontend design provides a complete, scalable, and user‑centric interface that fully addresses all 90 functional requirements of the AIMS, while leveraging the chosen technology stack for optimal performance in the Ethiopian operational context.
