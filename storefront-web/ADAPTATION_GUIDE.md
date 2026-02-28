# Storefront Web - Complete Adaptation Guide

## Overview

This guide explains how to customize all products, images, categories, and other elements to match your brand and business requirements.

---

## Part 1: Product Catalog Management

### Where Products Are Defined

Products are defined in **`src/app.js`** in the `CONFIG.defaultCatalog` array (lines 14-41):

```javascript
const CONFIG = {
  storageKeys: {
    session: 'cf.session.v1',
    catalog: 'cf.catalog.v1',
  },
  defaultCatalog: [
    {
      id: 'p1',                    // Unique identifier
      name: 'Camisa Premium',       // Product name
      category: 'Camisas',          // Category
      price: 89.99,                 // Price in USD
      badge: 'Destacado',           // Label (e.g., Featured, New, Trending)
      image: 'https://images.unsplash.com/photo-1607345591769-55f35d00202a?auto=format&fit=crop&w=400&q=80',
      description: 'Camisa de algodón 100% con diseño elegante y cómodo',
    },
    // ... more products
  ],
};
```

### Product Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique product identifier | `'p1'`, `'shoes-001'` |
| `name` | string | Product display name | `'Camisa Premium'` |
| `category` | string | Product category for filtering | `'Camisas'`, `'Electronics'` |
| `price` | number | Price in USD | `89.99`, `299.99` |
| `badge` | string | Label displayed on product card | `'Destacado'`, `'New'`, `'Sale'` |
| `image` | string | Product image URL (HTTP/HTTPS) | Full image URL from Unsplash or your own server |
| `description` | string | Short product description | `'High-quality cotton shirt'` |

---

## Part 2: Adding & Modifying Products

### Add a New Product

1. Open **`src/app.js`**
2. Locate the `CONFIG.defaultCatalog` array (around line 16)
3. Add a new product object at the end of the array:

```javascript
{
  id: 'p4',                          // Make it unique (e.g., p4, p5, etc.)
  name: 'Jeans Classic Style',
  category: 'Pantalones',
  price: 99.99,
  badge: 'Popular',
  image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=400&q=80',
  description: 'Blue jeans with comfortable fit and durable fabric',
},
```

4. Save the file
5. Refresh your browser to see the new product

### Modify an Existing Product

Example: Change the "Camisa Premium" name and price:

```javascript
{
  id: 'p1',
  name: 'Camisa Premium Azul',        // ← Changed
  category: 'Camisas',
  price: 99.99,                       // ← Changed
  badge: 'Destacado',
  image: 'https://images.unsplash.com/photo-1607345591769-55f35d00202a?auto=format&fit=crop&w=400&q=80',
  description: 'Camisa de algodón 100% con diseño elegante y cómodo',
},
```

### Delete a Product

Remove the entire product object from the array. For example, to delete `p3`:

```javascript
// BEFORE:
defaultCatalog: [
  { id: 'p1', ... },
  { id: 'p2', ... },
  { id: 'p3', ... }  // ← DELETE THIS ENTIRE OBJECT
]

// AFTER:
defaultCatalog: [
  { id: 'p1', ... },
  { id: 'p2', ... }
]
```

---

## Part 3: Managing Images

### Using External Image URLs

The template uses **Unsplash** URLs by default. You can:

#### Option 1: Use Unsplash (Free)

Visit [https://unsplash.com](https://unsplash.com) and search for products:

1. Search for product (e.g., "shirt", "shoes", "electronics")
2. Click on the image
3. Copy the URL from the browser address bar
4. Add `?auto=format&fit=crop&w=400&q=80` for optimization
5. Paste into the product's `image` field

Example:
```javascript
image: 'https://images.unsplash.com/photo-YOUR_ID?auto=format&fit=crop&w=400&q=80'
```

#### Option 2: Use Your Own Server

If you have product images on your server:

```javascript
image: 'https://your-domain.com/images/shirt-001.jpg',
// or from relative path:
image: '/images/products/shirt.png',
```

#### Option 3: Use Cloudinary (Free Tier)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Upload product images
3. Copy the image URL
4. Paste into product's `image` field

#### Image Size Recommendations

- **Width:** 400px (as shown in the URL parameter `w=400`)
- **Height:** At least 400px for square aspect ratio
- **Format:** JPG, PNG (JPG recommended for file size)
- **File Size:** Keep under 200KB per image

---

## Part 4: Managing Categories

### Add a New Category

Categories are automatically detected from products' `category` field. To add a new category:

1. Create a product with the new category name:

```javascript
{
  id: 'p10',
  name: 'Laptop Pro',
  category: 'Electronics',          // ← This creates a new category
  price: 999.99,
  badge: 'New',
  image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
  description: 'High-performance laptop',
}
```

2. The category filter will automatically include "Electronics" in the dropdown

### Modify Category Names

If you want all products to use consistent category names:

```javascript
// BAD: Inconsistent naming
{ category: 'Camisas', ... },
{ category: 'camisas', ... },        // ← Will create a second filter option
{ category: 'T-shirts', ... },       // ← Will create a third

// GOOD: Consistent
{ category: 'Camisas', ... },
{ category: 'Camisas', ... },
{ category: 'Camisas', ... },
```

---

## Part 5: Brand & UI Customization

### Change Branding (Header, Footer, Text)

#### Logo & Brand Name

Open **`index.html`** and find the navbar section:

```html
<!-- BEFORE: -->
<span>CommerceFlow</span>

<!-- AFTER: -->
<span>My Store Name</span>
```

#### Logo SVG (Optional)

Replace the SVG icon:

```html
<!-- BEFORE: -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
  <path d="M16 2l11 6v16l-11 6-11-6V8l11-6zm0 4l-7 4v9l7 4 7-4v-9l-7-4z"/>
</svg>

<!-- AFTER: Use any SVG or image -->
<img src="./logo.png" width="32" height="32" alt="Logo" />
```

#### Hero Section Text

In **`index.html`**, find and modify:

```html
<h1>Tu tienda en línea profesional</h1>
<p>Plataforma e-commerce moderna con pagos seguros, inventario en tiempo real y análisis avanzados</p>
```

#### Features Section

Modify the feature cards in **`index.html`**:

```html
<div class="feature-card">
  <div class="feature-icon">🔒</div>
  <h3>Seguridad empresarial</h3>      <!-- Change this -->
  <p>Your custom description here</p>  <!-- And this -->
</div>
```

#### Footer Text

In **`index.html`**:

```html
<p>&copy; 2026 CommerceFlow. Todos los derechos reservados.</p>
<!-- Change to: -->
<p>&copy; 2026 My Store. All rights reserved.</p>
```

### Change Colors & Styles

All colors are in **`styles.css`** at the top as CSS variables:

```css
:root {
  --primary: #6366f1;          /* Main brand color */
  --primary-dark: #4f46e5;
  --secondary: #8b5cf6;
  --text: #1f2937;
  --text-light: #6b7280;
  --text-muted: #9ca3af;
  --bg: #ffffff;
  --bg-alt: #f9fafb;
  --border: #e5e7eb;
  --success: #10b981;
  --danger: #ef4444;
}
```

Change any color:

```css
:root {
  --primary: #00aa88;          /* New brand color (teal) */
  --secondary: #ff6b6b;        /* New accent color (red) */
}
```

---

## Part 6: Session & Authentication Customization

### Demo Login Credentials

The app has NO backend validation, so **any email with password >= 8 chars** works:

- **Email:** user@example.com (or any email)
- **Password:** password123 (minimum 8 characters)
- **Role:** `customer` or `employer`

### Change Default Role Permissions

Open **`src/app.js`** and find the `isAdmin()` function:

```javascript
function isAdmin() {
  return isAuthenticated() && STATE.session.role === 'employer';
}
```

This checks if the role is `'employer'`. To require a different role:

```javascript
function isAdmin() {
  return isAuthenticated() && STATE.session.role === 'admin'; // Changed
}
```

Then update the login form in **`index.html`**:

```html
<select name="role" required>
  <option value="customer">Customer</option>
  <option value="admin">Administrator</option>  <!-- Changed from "employer" -->
</select>
```

---

## Part 7: API Endpoints & Checkout

### Checkout Flow

When a customer clicks "Checkout", the app:

1. Sends `POST /api/processes` with order data
2. Then sends `POST /api/processes/start-execution`

To connect to your real backend, modify **`src/app.js`** in the checkout function:

```javascript
// Find the checkout implementation:
const checkout = async (orderData) => {
  const response = await fetch('/api/processes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`  // Add JWT token
    },
    body: JSON.stringify(orderData)
  });
  
  return await response.json();
};
```

### API Base URL

To use a different API server, look for all `fetch()` calls in **`src/app.js`** and update the URLs:

```javascript
// BEFORE:
fetch('/api/products')

// AFTER (with your backend URL):
const API_BASE = 'https://api.your-domain.com';
fetch(`${API_BASE}/api/products`)
```

---

## Part 8: Admin Panel Customization

### Access Admin Panel

1. Login with role: **`employer`**
2. Click "Panel de admin" button in navbar
3. You can:
   - **Add Products:** Fill form and click "Save product"
   - **Edit Products:** Click edit button on any product
   - **Delete Products:** Click delete button
   - **View Analytics:** Switch to Analytics tab (shows random demo data)

### Products Admin Tab HTML

In **`index.html`**, find the products admin section and customize:

```html
<div id="products-tab" class="tab-content">
  <button id="add-product-btn">+ Add Product</button>
  <div id="admin-products-list"></div>
  <form id="product-form" style="display: none;">
    <!-- Customize form fields here -->
    <input name="name" placeholder="Product name" required />
    <input name="price" type="number" placeholder="Price" required />
    <input name="category" placeholder="Category" required />
    <input name="badge" placeholder="Badge (e.g., New, Sale)" required />
    <input name="image" placeholder="Image URL" required />
    <textarea name="description" placeholder="Description" required></textarea>
    <button type="submit">Save Product</button>
    <button type="button" id="cancel-product-form">Cancel</button>
  </form>
</div>
```

---

## Part 9: Running Tests After Modifications

### Why Tests Matter

Each time you modify products, categories, or HTML elements, run tests to ensure nothing broke:

```bash
cd storefront-web
npm test
```

### Expected Output

```
Test Suites: 1 passed, 1 total
Tests:       53 passed, 53 total
```

### If Tests Fail

Common reasons:

1. **HTML element ID changed** → Update the test that references it
2. **Category name changed** → Tests may expect specific categories
3. **Product removed** → Tests referencing that product will fail

### Quick Fix

If you changed an element ID in `index.html`:

Example: You changed `id="login-btn"` to `id="signin-button"`

Then update the test file `tests/storefront-web.test.ts`:

**Find:**
```typescript
const loginBtn = document.getElementById('login-btn');
```

**Replace with:**
```typescript
const loginBtn = document.getElementById('signin-button');
```

Then run `npm test` again.

---

## Part 10: Complete Example - Creating a Tech Store

Here's a complete example of adapting the template for a tech store:

### Step 1: Update Products in `src/app.js`

```javascript
defaultCatalog: [
  {
    id: 'tech-1',
    name: 'MacBook Pro 14"',
    category: 'Laptops',
    price: 1999.99,
    badge: 'Premium',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    description: 'Powerful laptop for professionals and developers',
  },
  {
    id: 'tech-2',
    name: 'AirPods Pro',
    category: 'Audio',
    price: 249.99,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    description: 'Premium wireless earbuds with noise cancellation',
  },
  {
    id: 'tech-3',
    name: '4K Webcam',
    category: 'Accessories',
    price: 179.99,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1598986646542-6e6e7d8df4fc?auto=format&fit=crop&w=400&q=80',
    description: 'Crystal-clear 4K video for streaming and calls',
  },
],
```

### Step 2: Update Branding in `index.html`

```html
<span>TechHub Store</span>  <!-- Changed from CommerceFlow -->

<h1>Professional Tech Equipment</h1>
<p>Quality gadgets for developers, creators, and tech enthusiasts</p>
```

### Step 3: Update Colors in `styles.css`

```css
:root {
  --primary: #0066cc;        /* Tech blue */
  --secondary: #ff6600;      /* Tech orange */
}
```

### Step 4: Run Tests

```bash
npm test
```

### Step 5: Open in Browser

```bash
npx serve storefront-web
# or
python -m http.server 8000
```

Visit `http://localhost:3000` or `http://localhost:8000/storefront-web`

---

## Part 11: Useful Links & Resources

### Image Sources
- **Unsplash:** https://unsplash.com (Free stock photos)
- **Pexels:** https://www.pexels.com (Free stock photos)
- **Pixabay:** https://pixabay.com (Free stock photos)
- **Cloudinary:** https://cloudinary.com (Image hosting)

### Color Tools
- **Color Picker:** https://coolors.co
- **Gradient Generator:** https://www.gradientgenerator.com

### Icon Resources
- **Heroicons:** https://heroicons.com (SVG icons)
- **Font Awesome:** https://fontawesome.com (Icon library)

---

## Part 12: Troubleshooting

### Issue: Products don't appear

1. Check if product has all required fields (id, name, price, image, etc.)
2. Ensure image URL is valid (starts with `http://` or `https://`)
3. Check browser console for errors (F12)
4. Clear localStorage: `localStorage.clear()` in console

### Issue: Tests fail after modifying HTML

1. Find which test failed in the output
2. Update the element ID or class selector in `tests/storefront-web.test.ts`
3. Run `npm test` again

### Issue: Images not loading

1. Check image URL is complete and accessible
2. Test URL in browser directly
3. Ensure URL has proper `https://` (not `http://`)
4. If using relative paths, ensure file exists in correct location

### Issue: Categories don't show in filter

1. Ensure product `category` field is not empty
2. Category names are case-sensitive with spaces
3. Clear localStorage and refresh: `localStorage.clear()`

---

## Summary of Key Files to Modify

| File | Purpose | What to Change |
|------|---------|-----------------|
| `src/app.js` | Product data & logic | Product catalog, categories, API endpoints |
| `styles.css` | Styling | Colors, fonts, layout |
| `index.html` | Structure & layout | Brand name, hero text, features, footer |
| `tests/storefront-web.test.ts` | Automated tests | Element selectors if HTML changed |

---

**Ready to adapt? Start with Part 1 and work through each section!**
