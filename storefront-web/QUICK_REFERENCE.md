# Quick Reference - Code Snippets

## Add a New Product (Copy-Paste Ready)

**File:** `src/app.js` line ~16 in `CONFIG.defaultCatalog`

```javascript
{
  id: 'p4',
  name: 'Your Product Name',
  category: 'Your Category',
  price: 199.99,
  badge: 'New',
  image: 'https://images.unsplash.com/photo-YOUR_ID?auto=format&fit=crop&w=400&q=80',
  description: 'Your product description here',
},
```

---

## Change Brand Name

**File:** `index.html` line ~20

```html
<!-- BEFORE: -->
<span>CommerceFlow</span>

<!-- AFTER: -->
<span>My Store Name</span>
```

---

## Change Hero Title & Subtitle

**File:** `index.html` line ~48-50

```html
<!-- BEFORE: -->
<h1>Tu tienda en línea profesional</h1>
<p>Plataforma e-commerce moderna con pagos seguros, inventario en tiempo real y análisis avanzados</p>

<!-- AFTER: -->
<h1>Welcome to My Store</h1>
<p>Shop the latest products with fast shipping and secure checkout</p>
```

---

## Change Primary Brand Color

**File:** `styles.css` line ~2

```css
/* BEFORE: */
--primary: #6366f1;

/* AFTER: */
--primary: #0066cc;  /* Your color */
```

---

## Change Featured Feature Cards

**File:** `index.html` line ~102-137

```html
<!-- BEFORE: -->
<div class="feature-card">
  <div class="feature-icon">🔒</div>
  <h3>Seguridad empresarial</h3>
  <p>Cumplimiento de normas internacionales...</p>
</div>

<!-- AFTER: -->
<div class="feature-card">
  <div class="feature-icon">⚡</div>
  <h3>Super Fast Shipping</h3>
  <p>Get your order within 24 hours</p>
</div>
```

---

## Update Footer Copyright

**File:** `index.html` line ~348

```html
<!-- BEFORE: -->
<p>&copy; 2026 CommerceFlow. Todos los derechos reservados.</p>

<!-- AFTER: -->
<p>&copy; 2026 My Store. All rights reserved.</p>
```

---

## Add New Product Category

Just add a product with a new category name and it auto-appears:

**File:** `src/app.js`

```javascript
{
  id: 'p10',
  name: 'New Item',
  category: 'New Category',  // ← This becomes a filter option
  price: 99.99,
  badge: 'New',
  image: 'https://images.unsplash.com/...',
  description: 'Description',
},
```

---

## Remove a Product

**File:** `src/app.js` in `CONFIG.defaultCatalog`

Find the product object and DELETE the entire curly brace block `{...}`

```javascript
// REMOVE THIS ENTIRE BLOCK:
{
  id: 'p3',
  name: 'Sneakers Clásicas',
  category: 'Calzado',
  price: 149.99,
  badge: 'Trending',
  image: 'https://...',
  description: '...',
},
```

---

## Change Language (Spanish to English Example)

Search and replace in these files:

| Spanish | English |
|---------|---------|
| `Categorías` | `Categories` |
| `Camisas` | `Shirts` |
| `Pantalones` | `Pants` |
| `Calzado` | `Shoes` |
| `Destacado` | `Featured` |
| `Nuevo` | `New` |
| `Trending` | `Trending` |
| `Carrito` | `Cart` |
| `Añadir` | `Add` |

---

## Update Product Image URL

**File:** `src/app.js` in any product object:

```javascript
// BEFORE:
image: 'https://images.unsplash.com/photo-1607345591769-55f35d00202a?auto=format&fit=crop&w=400&q=80',

// AFTER (find new image on Unsplash):
image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=400&q=80',
```

---

## Update Product Price

**File:** `src/app.js`

```javascript
// BEFORE:
price: 89.99,

// AFTER:
price: 129.99,
```

---

## Update Product Description

**File:** `src/app.js`

```javascript
// BEFORE:
description: 'Camisa de algodón 100% con diseño elegante y cómodo',

// AFTER:
description: 'Premium cotton shirt with elegant and comfortable design',
```

---

## Update Product Name

**File:** `src/app.js`

```javascript
// BEFORE:
name: 'Camisa Premium',

// AFTER:
name: 'Premium Dress Shirt',
```

---

## Update Product Badge

**File:** `src/app.js`

```javascript
// Available badges:
badge: 'Nuevo',          // New
badge: 'Destacado',      // Featured
badge: 'Trending',       // Trending
badge: 'Sale',           // On Sale
badge: 'Popular',        // Popular
badge: 'Limited',        // Limited Edition
```

---

## Change Role Permissions (from 'employer' to 'manager')

**File 1:** `src/app.js`

```javascript
// BEFORE:
function isAdmin() {
  return isAuthenticated() && STATE.session.role === 'employer';
}

// AFTER:
function isAdmin() {
  return isAuthenticated() && STATE.session.role === 'manager';
}
```

**File 2:** `index.html` in login form

```html
<!-- BEFORE: -->
<option value="employer">Employer</option>

<!-- AFTER: -->
<option value="manager">Manager</option>
```

---

## Change API Endpoint

**File:** `src/app.js`

Find all `fetch()` calls and update:

```javascript
// BEFORE:
fetch('/api/products')

// AFTER:
fetch('https://api.your-domain.com/api/products')
```

Or set a constant:

```javascript
const API_BASE = 'https://api.your-domain.com';

// Then use:
fetch(`${API_BASE}/api/products`)
```

---

## Run Tests After Changes

```bash
npm test
```

Expected output:
```
Test Suites: 1 passed, 1 total
Tests:       53 passed, 53 total
```

---

## Update Test if HTML Element ID Changed

**If you changed this in `index.html`:**
```html
<button id="old-id">Click me</button>
<!-- to: -->
<button id="new-id">Click me</button>
```

**Update this in `tests/storefront-web.test.ts`:**

```typescript
// Find:
const btn = document.getElementById('old-id');

// Replace with:
const btn = document.getElementById('new-id');
```

---

## Common Unsplash Image IDs (For Copy-Paste)

Professional photos for e-commerce:

| Product Type | URL |
|--------------|-----|
| Shirts | `https://images.unsplash.com/photo-1607345591769-55f35d00202a?auto=format&fit=crop&w=400&q=80` |
| Pants | `https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=400&q=80` |
| Shoes | `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80` |
| Laptop | `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80` |
| Phone | `https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=400&q=80` |
| Watch | `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80` |
| Headphones | `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80` |
| Camera | `https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=400&q=80` |

---

## Format for Multiple Products (Template)

```javascript
defaultCatalog: [
  {
    id: 'p1',
    name: 'Product 1',
    category: 'Category A',
    price: 99.99,
    badge: 'New',
    image: 'https://images.unsplash.com/...1',
    description: 'Description 1',
  },
  {
    id: 'p2',
    name: 'Product 2',
    category: 'Category A',
    price: 199.99,
    badge: 'Popular',
    image: 'https://images.unsplash.com/...2',
    description: 'Description 2',
  },
  {
    id: 'p3',
    name: 'Product 3',
    category: 'Category B',
    price: 149.99,
    badge: 'Sale',
    image: 'https://images.unsplash.com/...3',
    description: 'Description 3',
  },
],
```

---

**Need help? Check ADAPTATION_GUIDE.md for detailed explanations!**
