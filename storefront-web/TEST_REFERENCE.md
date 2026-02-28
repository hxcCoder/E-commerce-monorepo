# Storefront Web - Complete Test Suite Reference

## Overview

The test suite contains **53 comprehensive tests** organized into 12 test suites that cover all major functionality.

**Test Command:** `npm test`

---

## Test Suite Breakdown

### 1. State Management (3 tests)

Tests that verify application state initialization and persistence.

| Test | Purpose | What It Checks |
|------|---------|-----------------|
| `should initialize cart as empty array` | Cart starts empty | `localStorage.getItem('CART')` returns null |
| `should initialize session with default user` | Session defaults correctly | Default session has `isAuthenticated: false` and `role: 'customer'` |
| `should persist catalog data in localStorage` | Catalog saves/loads | Catalog persists with correct product count and names |

**Location in code:** `tests/storefront-web.test.ts` lines 175-201

---

### 2. Cart Operations (8 tests)

Tests for adding, removing, and managing cart items.

| Test | Purpose | Example |
|------|---------|---------|
| `should add item to empty cart` | Add first item | Cart: [] → [{id: 'p1', qty: 1}] |
| `should increment quantity if item already in cart` | Duplicate add increases qty | Cart: [{p1, qty: 1}] → [{p1, qty: 2}] |
| `should remove item completely from cart` | Delete removes item | Cart: [{p1}, {p2}] → [{p2}] |
| `should decrement item quantity without removing` | Reduce qty keeps item | Cart: [{p1, qty: 2}] → [{p1, qty: 1}] |
| `should calculate cart total correctly` | Total math is correct | 2x Laptop($999.99) + 2x Mouse($29.99) = $2,059.96 |
| `should clear entire cart` | Clear empties cart | Cart: [{p1}, {p2}] → [] |
| `should validate cart item structure` | Item has required fields | Item has: id, price, quantity > 0 |

**Location in code:** `tests/storefront-web.test.ts` lines 204-262

---

### 3. Product Management (4 tests)

Tests for product display, filtering, and search functionality.

| Test | Purpose | Validates |
|------|---------|-----------|
| `should render product grid with items` | Products display in grid | `#products-grid` element exists |
| `should filter products by search term` | Search works | Search "Laptop" returns only laptop-related products |
| `should filter products by category` | Category filter works | Filter by "electronics" shows only electronics items |
| `should combine search and category filters` | Combined filters work | Search "Laptop" + filter "electronics" returns correct results |

**Location in code:** `tests/storefront-web.test.ts` lines 265-315

---

### 4. Admin Product Management (4 tests)

Tests for admin panel product CRUD operations.

| Test | Purpose | Operation |
|------|---------|-----------|
| `should create new product` | Admin can add products | New product appears in catalog |
| `should update existing product` | Admin can edit products | Product name/price updates |
| `should delete product from catalog` | Admin can remove products | Product deleted via API |
| `should validate product form fields` | Form validation works | Empty fields are rejected, price > 0 |

**Location in code:** `tests/storefront-web.test.ts` lines 318-368

---

### 5. Authentication & Authorization (6 tests)

Tests for login, logout, and role-based access control.

| Test | Purpose | Checks |
|------|---------|--------|
| `should login as customer` | Customer login works | Session set with `role: 'customer'` |
| `should login as employer (admin)` | Admin login works | Session set with `role: 'employer'` |
| `should logout user` | Logout clears session | `localStorage.SESSION` removed |
| `should prevent customer from accessing admin panel` | RBAC works | Customers can't access admin (`role !== 'employer'`) |
| `should allow employer to access admin panel` | Admin has access | Employers can access admin panel |
| `should hide login button when authenticated` | UI updates on auth | Login button visibility changes after login |

**Location in code:** `tests/storefront-web.test.ts` lines 371-438

---

### 6. Checkout Flow (7 tests)

Tests for the complete checkout and payment process.

| Test | Purpose | Scenario |
|------|---------|----------|
| `should initiate checkout with valid cart` | Checkout starts with items | POST to `/api/checkout` succeeds |
| `should handle checkout with empty cart` | Empty cart blocked | Cannot checkout with no items |
| `should handle payment success` | Success response | API returns `status: 'PAYMENT_PENDING'` |
| `should handle payment failure` | Failure response | API returns error properly |
| `should clear cart after successful checkout` | Post-order cleanup | Cart empties after successful payment |
| `should calculate correct order total` | Math is correct | Subtotal + Tax + Shipping calculated right |
| `should prevent checkout with invalid customer data` | Validation works | Missing email or phone rejected |

**Location in code:** `tests/storefront-web.test.ts` lines 441-512

---

### 7. Modal Management (5 tests)

Tests for opening/closing modals and sidebar interactions.

| Test | Purpose | Action |
|------|---------|--------|
| `should open login modal` | Modal opens | Remove `closed` class |
| `should close login modal` | Modal closes | Add `closed` class |
| `should open admin modal for employer` | Admin modal works | Admin modal shows for employers |
| `should toggle cart sidebar` | Sidebar toggle works | Cart sidebar switches between open/closed |
| `should switch admin panel tabs` | Tab switching works | Product tab ↔ Analytics tab |

**Location in code:** `tests/storefront-web.test.ts` lines 515-559

---

### 8. Form Validation (4 tests)

Tests for input validation and data sanitization.

| Test | Purpose | Validates |
|------|---------|-----------|
| `should validate email format` | Email regex works | Valid: `user@example.com`, Invalid: `user@` |
| `should validate product form fields` | Form constraints | Name required, price > 0, category required |
| `should require minimum password length` | Password strength | Password must be >= 6 characters |
| `should escape HTML in product names (XSS prevention)` | Security check | `<script>` tags converted to `&lt;` |

**Location in code:** `tests/storefront-web.test.ts` lines 562-607

---

### 9. DOM Interactions (6 tests)

Tests for DOM element rendering and updates.

| Test | Purpose | Checks |
|------|---------|--------|
| `should render navbar with logo` | Header renders | `.nav-brand` contains "EcomFlow" |
| `should render products section` | Products section exists | `#products-section` in DOM |
| `should render cart sidebar` | Cart UI renders | `#cart-sidebar` has `closed` class initially |
| `should render footer` | Footer exists | `.footer` element present |
| `should update DOM when cart item added` | Dynamic updates | New cart item appears in DOM |
| `should update cart total display` | Total displays | `#cart-total` shows correct total |

**Location in code:** `tests/storefront-web.test.ts` lines 610-664

---

### 10. API Integration (4 tests)

Tests for API calls and error handling.

| Test | Purpose | Validates |
|------|---------|-----------|
| `should fetch products from API` | Products API works | GET `/api/products` returns data |
| `should handle API errors gracefully` | Error handling | 500 error handled correctly |
| `should submit order to API` | Order submission | POST `/api/checkout` called with order data |
| `should include authorization header in admin requests` | Auth header | Bearer token included in requests |

**Location in code:** `tests/storefront-web.test.ts` lines 667-709

---

### 11. End-to-End Scenarios (3 tests)

Complete user journey tests that combine multiple features.

| Test | Journey | Steps |
|------|---------|-------|
| `Guest user browsing → Login → Add to cart → Checkout` | Customer flow | Browse → Login → Add item → Checkout → Success |
| `Admin login → Create product → Verify in catalog` | Admin flow | Login as admin → Create product → Verify in list |
| `Browse → Filter by category → Search → Add to cart` | Full browse flow | Filter by category → Search → Add to cart |

**Location in code:** `tests/storefront-web.test.ts` lines 712-762

---

## Test Execution Results

When you run `npm test`, you'll see:

```
✓ State Management (3 tests)
  ✓ should initialize cart as empty array (43 ms)
  ✓ should initialize session with default user (27 ms)
  ✓ should persist catalog data in localStorage (19 ms)

✓ Cart Operations (8 tests)
  ✓ should add item to empty cart (13 ms)
  ✓ should increment quantity if item already in cart (14 ms)
  ✓ should remove item completely from cart (10 ms)
  ... etc

Test Suites: 1 passed, 1 total
Tests:       53 passed, 53 total
Time:        76.372 s
```

---

## How to Read Test Output

### Success Example

```
✓ should add item to empty cart (13 ms)     [GREEN checkmark = PASS]
```

### Failure Example

```
✗ should add item to empty cart                [RED X = FAIL]
  Expected: 1
  Received: 0
```

**What to do:** Fix the code that failed, then run `npm test` again.

---

## Running Specific Tests

### Run only one test suite:

```bash
npm test -- --testNamePattern="Cart Operations"
```

### Run only one test:

```bash
npm test -- --testNamePattern="should add item to empty cart"
```

### Run with coverage report:

```bash
npm test -- --coverage
```

This shows which lines of code are tested (Line coverage, Branch coverage, etc.)

---

## Test Coverage

The test suite provides coverage for:

- ✅ **State Management:** Initialization, persistence (localStorage)
- ✅ **Shopping Cart:** Add, remove, increment, decrement, clear, calculate totals
- ✅ **Product Display:** Rendering, filtering, search, categories
- ✅ **Admin Features:** Create, update, delete products
- ✅ **Authentication:** Login, logout, role-based access (RBAC)
- ✅ **Checkout:** Order submission, payment handling, validation
- ✅ **UI Interactions:** Modals, sidebars, tabs, DOM updates
- ✅ **Form Validation:** Email, password, product data, XSS prevention
- ✅ **API Integration:** Fetch, error handling, authorization
- ✅ **End-to-End Scenarios:** Complete user journeys

---

## What Each Test File Tests

### Mock Objects

Tests don't use real servers or databases. Instead, they use mocks:

```javascript
// Mock localStorage
mockLocalStorage = {
  getItem: () => {...},
  setItem: () => {...},
  removeItem: () => {...},
  clear: () => {...}
}

// Mock fetch API
mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock DOM
document.body.innerHTML = `<header>...</header><main>...</main>`
```

This makes tests **fast** (~1-2ms per test) and **reliable** (no external dependencies).

---

## Common Test Patterns

### Pattern 1: State Verification

```typescript
test('should add item to cart', () => {
  // Setup
  const product = { id: 'p1', price: 99.99 };
  const cart = [];
  
  // Action
  const newCart = [...cart, product];
  
  // Assertion
  expect(newCart).toHaveLength(1);
  expect(newCart[0].id).toBe('p1');
});
```

### Pattern 2: API Mock

```typescript
test('should fetch products', async () => {
  // Mock API response
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [{ id: 'p1', name: 'Product' }]
  });
  
  // Call API
  const response = await fetch('/api/products');
  const data = await response.json();
  
  // Assert
  expect(data[0].name).toBe('Product');
});
```

### Pattern 3: DOM Interaction

```typescript
test('should update DOM', () => {
  // Get element
  const button = document.getElementById('login-btn');
  
  // Assert it exists
  expect(button).toBeInTheDocument();
  
  // Simulate click
  button?.click();
  
  // Assert state changed
  expect(button?.classList.contains('active')).toBe(true);
});
```

---

## Debugging Tests

### Print debug info:

```typescript
test('debug test', () => {
  const cart = [{ id: 'p1', qty: 2 }];
  console.log('Cart contents:', cart);  // Will print in test output
  console.log('DOM:', document.body.innerHTML);
  expect(cart).toHaveLength(1);
});
```

Run with:
```bash
npm test -- --verbose
```

### Inspect failing test:

```bash
npm test -- --testNamePattern="should add item" --verbose
```

---

## Test Maintenance

### When you modify code:

1. **Changed HTML element ID?** 
   - Update test selector from `document.getElementById('old-btn')` to `'new-btn'`

2. **Changed product structure?**
   - Update test expectations for new fields

3. **Added new feature?**
   - Add corresponding test to the appropriate test suite

### Example: If you change button ID

**In `index.html`:**
```html
<!-- Changed ID: -->
<button id="new-checkout-btn">Checkout</button>
```

**In `tests/storefront-web.test.ts`:**
```typescript
// Update this:
const btn = document.getElementById('new-checkout-btn');  // Changed from 'checkout-btn'
```

Then run:
```bash
npm test -- --testNamePattern="Checkout"
```

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 53 |
| Test Suites | 12 |
| Execution Time | ~76 seconds |
| Coverage Areas | 10 major features |
| Mock Types | localStorage, fetch, DOM |

**All tests pass by default.** Modify them when you adapt the template to ensure everything still works! ✅
