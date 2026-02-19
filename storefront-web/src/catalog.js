const STORAGE_KEY = 'commerceflow.catalog.v1';

const defaultCatalog = [
  {
    id: 'p-1',
    name: 'Urban Linen Shirt',
    category: 'Men',
    badge: 'Best Seller',
    price: 49.9,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Breathable premium linen shirt for smart-casual outfits.',
  },
  {
    id: 'p-2',
    name: 'Classic Women Blazer',
    category: 'Women',
    badge: 'New',
    price: 89,
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    description: 'Structured blazer designed for comfort and style.',
  },
  {
    id: 'p-3',
    name: 'Essential Sneakers',
    category: 'Footwear',
    badge: 'Top Rated',
    price: 64.5,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    description: 'All-day sneakers with cushioned sole and lightweight fit.',
  },
];

export function loadCatalog() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...defaultCatalog];

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [...defaultCatalog];
    return data;
  } catch (_error) {
    return [...defaultCatalog];
  }
}

export function saveCatalog(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function resetCatalog() {
  localStorage.removeItem(STORAGE_KEY);
  return [...defaultCatalog];
}
