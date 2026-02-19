import { loadCatalog, saveCatalog, resetCatalog } from './catalog.js';
import { createAndStartOrder, getApiBase, getToken, setApiBase, setToken } from './api.js';
import { storeConfig } from './config.js';

const SESSION_KEY = 'commerceflow.session.v1';

const state = {
  catalog: loadCatalog(),
  cart: new Map(),
  category: 'all',
  search: '',
  session: loadSession(),
};

const catalogEl = document.getElementById('catalog');
const categoryFilterEl = document.getElementById('category-filter');
const searchInputEl = document.getElementById('search-input');
const adminListEl = document.getElementById('admin-list');
const cartItemsEl = document.getElementById('cart-items');
const checkoutResultEl = document.getElementById('checkout-result');
const adminPanelEl = document.getElementById('admin-panel');
const loginModalEl = document.getElementById('login-modal');
const sessionChipEl = document.getElementById('session-chip');
const logoutButtonEl = document.getElementById('logout');
const openLoginButtonEl = document.getElementById('open-login');

const apiBaseInput = document.getElementById('api-base');
const jwtTokenInput = document.getElementById('jwt-token');


function applyBranding() {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', storeConfig.theme.primary);
  root.style.setProperty('--color-primary-soft', storeConfig.theme.primarySoft);
  root.style.setProperty('--color-bg', storeConfig.theme.background);
  root.style.setProperty('--color-surface', storeConfig.theme.surface);
  root.style.setProperty('--color-text', storeConfig.theme.text);
  root.style.setProperty('--color-muted', storeConfig.theme.muted);

  document.getElementById('brand-name-chip').textContent = storeConfig.brand.name;
  document.getElementById('brand-subtitle').textContent = storeConfig.brand.subtitle;
  document.getElementById('hero-tag').textContent = storeConfig.brand.tagline;
  document.getElementById('hero-headline').textContent = storeConfig.brand.headline;
  document.getElementById('hero-description').textContent = storeConfig.brand.description;
  document.getElementById('hero-cta').textContent = storeConfig.brand.ctaLabel;

  document.getElementById('about-title').textContent = storeConfig.sections.aboutTitle;
  document.getElementById('about-text').textContent = storeConfig.sections.aboutText;

  const highlights = document.getElementById('highlight-list');
  highlights.innerHTML = '';
  storeConfig.sections.highlights.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'highlight-card';
    card.innerHTML = `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p>`;
    highlights.appendChild(card);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function loadSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    return {
      email: parsed.email || null,
      role: parsed.role || 'guest',
      isAuthenticated: Boolean(parsed.isAuthenticated),
    };
  } catch {
    return { email: null, role: 'guest', isAuthenticated: false };
  }
}

function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
}

function isEmployer() {
  return state.session.isAuthenticated && state.session.role === 'employer';
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function getFilteredCatalog() {
  const activeCategory = state.category;
  const normalizedSearch = state.search.toLowerCase();

  return state.catalog.filter((item) => {
    const categoryMatch = activeCategory === 'all' || item.category.toLowerCase() === activeCategory;
    const searchMatch =
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.description.toLowerCase().includes(normalizedSearch) ||
      item.category.toLowerCase().includes(normalizedSearch);
    return categoryMatch && searchMatch;
  });
}

function cartEntries() {
  return [...state.cart.values()];
}

function cartTotals() {
  const subtotal = cartEntries().reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? 8.5 : 0;
  const tax = subtotal * 0.12;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

function renderSession() {
  if (!state.session.isAuthenticated) {
    sessionChipEl.textContent = 'Guest mode';
    openLoginButtonEl.classList.remove('hidden');
    logoutButtonEl.classList.add('hidden');
    return;
  }

  sessionChipEl.textContent = `${state.session.role.toUpperCase()} · ${state.session.email}`;
  openLoginButtonEl.classList.add('hidden');
  logoutButtonEl.classList.remove('hidden');
}

function renderCategoryFilter() {
  const categories = ['all', ...new Set(state.catalog.map((item) => item.category.toLowerCase()))];
  const current = state.category;

  categoryFilterEl.innerHTML = '';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category === 'all' ? 'All categories' : category[0].toUpperCase() + category.slice(1);
    if (category === current) option.selected = true;
    categoryFilterEl.appendChild(option);
  });
}

function renderCatalog() {
  catalogEl.innerHTML = '';
  const products = getFilteredCatalog();

  if (!products.length) {
    catalogEl.innerHTML = '<p>No products found for this filter.</p>';
    return;
  }

  products.forEach((item) => {
    const safeName = escapeHtml(item.name);
    const safeCategory = escapeHtml(item.category);
    const safeBadge = escapeHtml(item.badge || 'Featured');
    const safeDescription = escapeHtml(item.description);
    const safeImage = escapeHtml(item.image);

    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${safeImage}" alt="${safeName}" loading="lazy" />
      <div class="card-content">
        <div class="card-meta">
          <span>${safeCategory}</span>
          <span class="badge">${safeBadge}</span>
        </div>
        <h3>${safeName}</h3>
        <p>${safeDescription}</p>
        <div class="price-row">
          <strong>${formatMoney(item.price)}</strong>
          <button class="btn btn-primary" data-add="${item.id}" type="button">Add</button>
        </div>
      </div>
    `;
    catalogEl.appendChild(card);
  });
}

function renderAdminList() {
  adminListEl.innerHTML = '';

  state.catalog.forEach((item) => {
    const safeName = escapeHtml(item.name);
    const row = document.createElement('div');
    row.className = 'admin-item';
    row.innerHTML = `
      <span>${safeName}</span>
      <small>${formatMoney(item.price)}</small>
      <button class="btn btn-ghost" data-edit="${item.id}" type="button">Edit</button>
      <button class="btn btn-danger" data-remove="${item.id}" type="button">Delete</button>
    `;
    adminListEl.appendChild(row);
  });
}

function renderCart() {
  cartItemsEl.innerHTML = '';

  if (!state.cart.size) {
    cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
  }

  cartEntries().forEach((item) => {
    const safeName = escapeHtml(item.name);
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <span>${safeName} × ${item.qty}</span>
      <div>
        <strong>${formatMoney(item.price * item.qty)}</strong>
        <button class="btn btn-ghost" data-dec="${item.id}" type="button">-</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  const totals = cartTotals();
  document.getElementById('subtotal').textContent = formatMoney(totals.subtotal);
  document.getElementById('shipping').textContent = formatMoney(totals.shipping);
  document.getElementById('tax').textContent = formatMoney(totals.tax);
  document.getElementById('total').textContent = formatMoney(totals.total);
  document.getElementById('kpi-items').textContent = String(cartEntries().reduce((sum, row) => sum + row.qty, 0));
  document.getElementById('kpi-products').textContent = String(state.catalog.length);
}

function buildCheckoutPayload() {
  const items = cartEntries().map((item) => ({ name: item.name, quantity: item.qty, price: item.price }));
  return {
    name: `Storefront order ${new Date().toISOString()}`,
    userId: state.session.email || 'web-customer',
    metadata: {
      source: 'storefront-web',
      customerRole: state.session.role,
      items,
      totals: cartTotals(),
    },
    steps: [
      { name: 'Validate payment and order totals' },
      { name: 'Reserve stock and notify warehouse' },
      { name: 'Create shipment and email confirmation' },
    ],
  };
}

function openModal(modalElement) {
  modalElement.classList.remove('hidden');
  modalElement.setAttribute('aria-hidden', 'false');
}

function closeModal(modalElement) {
  modalElement.classList.add('hidden');
  modalElement.setAttribute('aria-hidden', 'true');
}

function clearProductForm() {
  const form = document.getElementById('product-form');
  form.reset();
  document.getElementById('product-id').value = '';
  document.getElementById('save-product').textContent = 'Save product';
}

function refreshStore() {
  renderCategoryFilter();
  renderCatalog();
  renderAdminList();
  renderSession();
}

function handleProductSave(event) {
  event.preventDefault();
  if (!isEmployer()) {
    checkoutResultEl.textContent = 'Only employer accounts can manage products.';
    return;
  }

  const formData = new FormData(event.currentTarget);
  const productId = String(formData.get('id') || '').trim();
  const newItem = {
    id: productId || `p-${crypto.randomUUID()}`,
    name: String(formData.get('name') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    badge: String(formData.get('badge') || '').trim(),
    price: Number(formData.get('price') || 0),
    image: String(formData.get('image') || '').trim(),
    description: String(formData.get('description') || '').trim(),
  };

  if (!newItem.name || !newItem.category || !Number.isFinite(newItem.price) || newItem.price <= 0 || !newItem.image || !newItem.description) {
    checkoutResultEl.textContent = 'Admin: product data is invalid.';
    return;
  }

  const currentIndex = state.catalog.findIndex((item) => item.id === newItem.id);
  if (currentIndex >= 0) {
    state.catalog[currentIndex] = newItem;
    checkoutResultEl.textContent = 'Product updated successfully.';
  } else {
    state.catalog = [newItem, ...state.catalog];
    checkoutResultEl.textContent = 'Product added successfully.';
  }

  saveCatalog(state.catalog);
  clearProductForm();
  refreshStore();
}

function bindEvents() {
  document.getElementById('open-admin').addEventListener('click', () => {
    if (!isEmployer()) {
      checkoutResultEl.textContent = 'Login as employer to access the panel.';
      openModal(loginModalEl);
      return;
    }
    openModal(adminPanelEl);
  });

  document.getElementById('close-admin').addEventListener('click', () => closeModal(adminPanelEl));
  document.getElementById('close-login').addEventListener('click', () => closeModal(loginModalEl));
  document.getElementById('open-login').addEventListener('click', () => openModal(loginModalEl));

  logoutButtonEl.addEventListener('click', () => {
    state.session = { email: null, role: 'guest', isAuthenticated: false };
    saveSession();
    refreshStore();
    checkoutResultEl.textContent = 'Session closed.';
  });

  adminPanelEl.addEventListener('click', (event) => {
    if (event.target === adminPanelEl) closeModal(adminPanelEl);
  });

  loginModalEl.addEventListener('click', (event) => {
    if (event.target === loginModalEl) closeModal(loginModalEl);
  });

  document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');
    const role = String(formData.get('role') || 'customer');

    if (!email || password.length < 8) {
      checkoutResultEl.textContent = 'Invalid login credentials format.';
      return;
    }

    state.session = { email, role, isAuthenticated: true };
    saveSession();
    closeModal(loginModalEl);
    refreshStore();
    checkoutResultEl.textContent = `Welcome ${email}.`;
  });

  categoryFilterEl.addEventListener('change', () => {
    state.category = categoryFilterEl.value;
    renderCatalog();
  });

  searchInputEl.addEventListener('input', () => {
    state.search = searchInputEl.value.trim();
    renderCatalog();
  });

  catalogEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add]');
    if (!button) return;

    const product = state.catalog.find((item) => item.id === button.dataset.add);
    if (!product) return;

    const existing = state.cart.get(product.id);
    if (existing) existing.qty += 1;
    else state.cart.set(product.id, { id: product.id, name: product.name, price: product.price, qty: 1 });
    renderCart();
  });

  cartItemsEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-dec]');
    if (!button) return;

    const item = state.cart.get(button.dataset.dec);
    if (!item) return;

    item.qty -= 1;
    if (item.qty <= 0) state.cart.delete(item.id);
    renderCart();
  });

  document.getElementById('product-form').addEventListener('submit', handleProductSave);
  document.getElementById('clear-product-form').addEventListener('click', clearProductForm);

  adminListEl.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove]');
    if (removeButton) {
      if (!isEmployer()) {
        checkoutResultEl.textContent = 'Only employer accounts can remove products.';
        return;
      }

      const id = removeButton.dataset.remove;
      state.catalog = state.catalog.filter((item) => item.id !== id);
      state.cart.delete(id);
      saveCatalog(state.catalog);
      refreshStore();
      renderCart();
      checkoutResultEl.textContent = 'Product deleted.';
      return;
    }

    const editButton = event.target.closest('[data-edit]');
    if (!editButton) return;
    if (!isEmployer()) {
      checkoutResultEl.textContent = 'Only employer accounts can edit products.';
      return;
    }

    const item = state.catalog.find((product) => product.id === editButton.dataset.edit);
    if (!item) return;

    const form = document.getElementById('product-form');
    form.elements.id.value = item.id;
    form.elements.name.value = item.name;
    form.elements.category.value = item.category;
    form.elements.badge.value = item.badge;
    form.elements.price.value = item.price;
    form.elements.image.value = item.image;
    form.elements.description.value = item.description;
    document.getElementById('save-product').textContent = 'Update product';
  });

  document.getElementById('reset-catalog').addEventListener('click', () => {
    if (!isEmployer()) {
      checkoutResultEl.textContent = 'Only employer accounts can reset catalog.';
      return;
    }

    state.catalog = resetCatalog();
    state.category = 'all';
    state.search = '';
    searchInputEl.value = '';
    state.cart.clear();
    clearProductForm();
    refreshStore();
    renderCart();
    checkoutResultEl.textContent = 'Catalog reset complete.';
  });

  apiBaseInput.value = getApiBase();
  jwtTokenInput.value = getToken();
  apiBaseInput.addEventListener('change', () => setApiBase(apiBaseInput.value.trim()));
  jwtTokenInput.addEventListener('change', () => setToken(jwtTokenInput.value.trim()));

  document.getElementById('checkout').addEventListener('click', async () => {
    checkoutResultEl.textContent = '';

    if (!state.cart.size) {
      checkoutResultEl.textContent = 'Add at least one product before checkout.';
      return;
    }

    try {
      const response = await createAndStartOrder({
        baseUrl: apiBaseInput.value.trim(),
        token: jwtTokenInput.value.trim(),
        payload: buildCheckoutPayload(),
      });

      state.cart.clear();
      renderCart();
      checkoutResultEl.textContent = `Order processed ✅ (${response.process.id}) requestId: ${response.requestId || 'n/a'}`;
    } catch (error) {
      checkoutResultEl.textContent = `Checkout failed: ${error.message}`;
    }
  });
}

applyBranding();
refreshStore();
renderCart();
bindEvents();
