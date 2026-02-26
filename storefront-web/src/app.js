// CommerceFlow Frontend - Modern E-commerce Platform

const STATE = {
  catalog: [],
  cart: new Map(),
  session: null,
  searchTerm: '',
  selectedCategory: 'all',
};

const CONFIG = {
  storageKeys: {
    session: 'cf.session.v1',
    catalog: 'cf.catalog.v1',
  },
  defaultCatalog: [
    {
      id: 'p1',
      name: 'Camisa Premium',
      category: 'Camisas',
      price: 89.99,
      badge: 'Destacado',
      image: 'https://images.unsplash.com/photo-1607345591769-55f35d00202a?auto=format&fit=crop&w=400&q=80',
      description: 'Camisa de algodón 100% con diseño elegante y cómodo',
    },
    {
      id: 'p2',
      name: 'Pantalón Casual',
      category: 'Pantalones',
      price: 129.99,
      badge: 'Nuevo',
      image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=400&q=80',
      description: 'Pantalón de mezclilla premium con ajuste perfecto',
    },
    {
      id: 'p3',
      name: 'Sneakers Clásicas',
      category: 'Calzado',
      price: 149.99,
      badge: 'Trending',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      description: 'Sneakers de lona con suela de goma duradera',
    },
  ],
};

// ==================== UTILITIES ====================

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== STORAGE ====================

function loadSession() {
  try {
    const stored = localStorage.getItem(CONFIG.storageKeys.session);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(CONFIG.storageKeys.session, JSON.stringify(session));
}

function loadCatalog() {
  try {
    const stored = localStorage.getItem(CONFIG.storageKeys.catalog);
    return stored ? JSON.parse(stored) : CONFIG.defaultCatalog;
  } catch {
    return CONFIG.defaultCatalog;
  }
}

function saveCatalog(catalog) {
  localStorage.setItem(CONFIG.storageKeys.catalog, JSON.stringify(catalog));
}

// ==================== SESSION ====================

function isAuthenticated() {
  return STATE.session && STATE.session.isAuthenticated;
}

function isAdmin() {
  return isAuthenticated() && STATE.session.role === 'employer';
}

function login(email, password, role) {
  STATE.session = {
    email,
    role,
    isAuthenticated: true,
    loginTime: new Date().toISOString(),
  };
  saveSession(STATE.session);
  updateSessionUI();
}

function logout() {
  STATE.session = null;
  localStorage.removeItem(CONFIG.storageKeys.session);
  updateSessionUI();
  closeAllModals();
}

function updateSessionUI() {
  const loginBtn = document.getElementById('btn-login');
  const logoutBtn = document.getElementById('btn-logout');
  const adminBtn = document.getElementById('admin-btn');

  if (isAuthenticated()) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    if (isAdmin()) {
      adminBtn.classList.remove('hidden');
    } else {
      adminBtn.classList.add('hidden');
    }
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    adminBtn.classList.add('hidden');
  }
}

// ==================== CART OPERATIONS ====================

function addToCart(productId) {
  const product = STATE.catalog.find(p => p.id === productId);
  if (!product) return;

  if (STATE.cart.has(productId)) {
    const item = STATE.cart.get(productId);
    item.quantity += 1;
  } else {
    STATE.cart.set(productId, {
      id: productId,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }
  updateCartUI();
}

function removeFromCart(productId) {
  STATE.cart.delete(productId);
  updateCartUI();
}

function decrementCartItem(productId) {
  const item = STATE.cart.get(productId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      STATE.cart.delete(productId);
    }
  }
  updateCartUI();
}

function getCartTotal() {
  let subtotal = 0;
  STATE.cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  const tax = subtotal * 0.12;
  const shipping = subtotal > 0 ? 8.5 : 0;
  return {
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
  };
}

function clearCart() {
  STATE.cart.clear();
  updateCartUI();
}

// ==================== UI UPDATES ====================

function updateCartUI() {
  const cartList = document.getElementById('cart-items-list');
  const cartToggle = document.getElementById('cart-toggle');

  // Update cart badge
  const itemCount = Array.from(STATE.cart.values()).reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = itemCount;

  // Update cart items list
  if (STATE.cart.size === 0) {
    cartList.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    document.getElementById('checkout-btn').disabled = true;
  } else {
    cartList.innerHTML = '';
    STATE.cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.style.padding = '1rem';
      itemEl.style.borderBottom = '1px solid var(--border)';
      itemEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${formatCurrency(item.price * item.quantity)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-muted); font-size: 0.875rem;">Qty: ${item.quantity}</span>
          <button class="btn btn-secondary" data-remove="${item.id}" style="padding: 0.5rem 0.75rem; font-size: 0.875rem;">Eliminar</button>
        </div>
      `;
      cartList.appendChild(itemEl);
    });
    document.getElementById('checkout-btn').disabled = false;
  }

  // Update cart summary
  const totals = getCartTotal();
  document.getElementById('summary-subtotal').textContent = formatCurrency(totals.subtotal);
  document.getElementById('summary-tax').textContent = formatCurrency(totals.tax);
  document.getElementById('summary-shipping').textContent = formatCurrency(totals.shipping);
  document.getElementById('summary-total').textContent = formatCurrency(totals.total);

  // Attach remove listeners
  cartList.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const filteredProducts = STATE.catalog.filter(product => {
    const categoryMatch = STATE.selectedCategory === 'all' || 
                         product.category.toLowerCase() === STATE.selectedCategory.toLowerCase();
    const searchMatch = STATE.searchTerm === '' ||
                       product.name.toLowerCase().includes(STATE.searchTerm) ||
                       product.description.toLowerCase().includes(STATE.searchTerm) ||
                       product.category.toLowerCase().includes(STATE.searchTerm);
    return categoryMatch && searchMatch;
  });

  if (filteredProducts.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No se encontraron productos</p>';
    return;
  }

  grid.innerHTML = '';
  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
      <div class="card-content">
        <div class="card-meta">
          <span>${escapeHtml(product.category)}</span>
          <span class="badge">${escapeHtml(product.badge)}</span>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="price-row">
          <strong>${formatCurrency(product.price)}</strong>
          <button class="btn btn-primary" data-add="${product.id}">Añadir</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.add));
  });
}

function updateCategoryFilter() {
  const select = document.getElementById('category-select');
  const categories = new Set(STATE.catalog.map(p => p.category));
  
  const currentValue = select.value;
  select.innerHTML = '<option value="all">Todas las categorías</option>';
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.toLowerCase();
    option.textContent = cat;
    select.appendChild(option);
  });

  select.value = currentValue || 'all';
}

function renderAdminProducts() {
  const adminList = document.getElementById('products-admin-list');
  
  if (STATE.catalog.length === 0) {
    adminList.innerHTML = '<p>No hay productos en el catálogo</p>';
    return;
  }

  adminList.innerHTML = '';
  const table = document.createElement('div');
  table.style.cssText = 'border: 1px solid var(--border); border-radius: 0.5rem; overflow: hidden;';
  
  STATE.catalog.forEach(product => {
    const row = document.createElement('div');
    row.className = 'admin-item';
    row.innerHTML = `
      <span>${escapeHtml(product.name)}</span>
      <span style="color: var(--text-muted);">${escapeHtml(product.category)}</span>
      <span style="font-weight: 600;">${formatCurrency(product.price)}</span>
      <button class="btn btn-secondary" data-edit="${product.id}" style="padding: 0.5rem 1rem; font-size: 0.875rem;">Editar</button>
      <button class="btn btn-danger" data-delete="${product.id}" style="padding: 0.5rem 1rem; font-size: 0.875rem;">Eliminar</button>
    `;
    table.appendChild(row);
  });

  adminList.appendChild(table);

  // Attach event listeners
  table.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.delete));
  });

  table.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => editProduct(btn.dataset.edit));
  });
}

function updateAdminMetrics() {
  const totalOrders = Math.floor(Math.random() * 100);
  const totalRevenue = getCartTotal().total * (Math.floor(Math.random() * 50) + 10);
  
  document.getElementById('metric-total-orders').textContent = totalOrders;
  document.getElementById('metric-total-revenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('metric-avg-order').textContent = formatCurrency(totalRevenue / Math.max(totalOrders, 1));
  document.getElementById('metric-products').textContent = STATE.catalog.length;
}

// ==================== PRODUCT MANAGEMENT ====================

function deleteProduct(productId) {
  if (!isAdmin()) return;
  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
  
  STATE.catalog = STATE.catalog.filter(p => p.id !== productId);
  saveCatalog(STATE.catalog);
  renderProducts();
  updateCategoryFilter();
  renderAdminProducts();
}

function editProduct(productId) {
  if (!isAdmin()) return;
  const product = STATE.catalog.find(p => p.id === productId);
  if (!product) return;

  const form = document.getElementById('product-form');
  form.name.value = product.name;
  form.category.value = product.category;
  form.price.value = product.price;
  form.badge.value = product.badge;
  form.image.value = product.image;
  form.description.value = product.description;
  
  form.dataset.productId = productId;
  form.scrollIntoView({ behavior: 'smooth' });
}

function handleProductFormSubmit(e) {
  if (!isAdmin()) {
    alert('Solo administradores pueden gestionar productos');
    return;
  }

  e.preventDefault();
  const form = document.getElementById('product-form');
  const formData = new FormData(form);

  const productData = {
    name: formData.get('name'),
    category: formData.get('category'),
    price: parseFloat(formData.get('price')),
    badge: formData.get('badge'),
    image: formData.get('image'),
    description: formData.get('description'),
  };

  if (!productData.name || !productData.category || !productData.image || !productData.description || isNaN(productData.price)) {
    alert('Por favor completa todos los campos correctamente');
    return;
  }

  if (form.dataset.productId) {
    const idx = STATE.catalog.findIndex(p => p.id === form.dataset.productId);
    if (idx >= 0) {
      STATE.catalog[idx] = { ...STATE.catalog[idx], ...productData };
    }
  } else {
    STATE.catalog.push({
      id: generateId(),
      ...productData,
    });
  }

  saveCatalog(STATE.catalog);
  form.reset();
  delete form.dataset.productId;
  renderProducts();
  updateCategoryFilter();
  renderAdminProducts();
  alert('Producto guardado correctamente');
}

function resetCatalog() {
  if (!confirm('¿Restaurar el catálogo por defecto? Se perderán todos los cambios.')) return;
  STATE.catalog = [...CONFIG.defaultCatalog];
  saveCatalog(STATE.catalog);
  renderProducts();
  updateCategoryFilter();
  renderAdminProducts();
}

// ==================== MODALS ====================

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.getElementById('overlay').classList.add('hidden');
}

function openModal(modalId) {
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById(modalId).classList.remove('hidden');
}

function setupModalEvents() {
  document.getElementById('overlay').addEventListener('click', closeAllModals);

  document.querySelectorAll('.btn-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });
}

// ==================== CHECKOUT ====================

async function handleCheckout() {
  if (STATE.cart.size === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  const apiEndpoint = document.getElementById('api-endpoint').value.trim();
  const jwtToken = document.getElementById('jwt-token-input').value.trim();

  if (!apiEndpoint) {
    alert('Por favor ingresa la URL del API backend');
    return;
  }

  const items = Array.from(STATE.cart.values()).map(item => ({
    productId: item.id,
    quantity: item.quantity,
    unitPrice: item.price,
  }));

  const totals = getCartTotal();

  try {
    const response = await fetch(`${apiEndpoint}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
      },
      body: JSON.stringify({
        items,
        userEmail: STATE.session?.email || 'guest@commerceflow.io',
        totals,
      }),
    });

    if (response.ok) {
      const message = document.getElementById('checkout-message');
      message.textContent = '✅ Pedido creado exitosamente';
      message.style.color = 'var(--success)';
      clearCart();
      setTimeout(() => {
        message.textContent = '';
        closeAllModals();
      }, 2000);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    const message = document.getElementById('checkout-message');
    message.textContent = `❌ Error: ${error.message}`;
    message.style.color = 'var(--danger)';
  }
}

// ==================== EVENT SETUP ====================

function setupEventListeners() {
  // Navigation
  document.getElementById('btn-login').addEventListener('click', () => openModal('login-modal'));
  document.getElementById('btn-logout').addEventListener('click', logout);
  document.getElementById('admin-btn').addEventListener('click', () => {
    updateAdminMetrics();
    openModal('admin-modal');
  });

  // Cart
  document.getElementById('cart-toggle').addEventListener('click', () => {
    document.getElementById('cart-sidebar').classList.toggle('closed');
  });

  document.getElementById('close-cart').addEventListener('click', () => {
    document.getElementById('cart-sidebar').classList.add('closed');
  });

  document.getElementById('checkout-btn').addEventListener('click', handleCheckout);

  // Search & Filter
  document.getElementById('search-box').addEventListener('input', (e) => {
    STATE.searchTerm = e.target.value.toLowerCase();
    renderProducts();
  });

  document.getElementById('category-select').addEventListener('change', (e) => {
    STATE.selectedCategory = e.target.value;
    renderProducts();
  });

  // Forms
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target[0].value.trim();
    const password = e.target[1].value;
    const role = e.target[2].value;

    if (!email || password.length < 8) {
      alert('Email y contraseña válidos requeridos');
      return;
    }

    login(email, password, role);
    closeAllModals();
    alert(`✅ Bienvenido ${email} (${role})`);
  });

  document.getElementById('product-form').addEventListener('submit', handleProductFormSubmit);
  document.getElementById('clear-form-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('product-form').reset();
    delete document.getElementById('product-form').dataset.productId;
  });

  document.getElementById('reset-catalog-btn').addEventListener('click', resetCatalog);

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(tabName).classList.add('active');

      if (tabName === 'analytics-tab') {
        updateAdminMetrics();
      }
    });
  });

  // Contact form
  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Gracias por tu mensaje. Te contactaremos pronto.');
    e.target.reset();
  });

  setupModalEvents();
}

// ==================== INITIALIZATION ====================

function init() {
  STATE.catalog = loadCatalog();
  STATE.session = loadSession();

  updateSessionUI();
  updateCategoryFilter();
  renderProducts();
  updateCartUI();
  setupEventListeners();

  console.log('CommerceFlow frontend initialized ✨');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


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
