import { useMemo, useState } from 'react';
import { getShopCategories, getShopProducts, getShopSettings } from '../utils/dataManager';

export default function ShopPage() {
  const shopSettings = useMemo(() => getShopSettings(), []);
  const categories = useMemo(() => getShopCategories(), []);
  const products = useMemo(() => getShopProducts(), []);

  const [activeCategoryId, setActiveCategoryId] = useState('all');

  const shownProducts = useMemo(() => {
    if (activeCategoryId === 'all') return products;
    return products.filter((p) => (p.categoryId || '') === activeCategoryId);
  }, [activeCategoryId, products]);

  if (!shopSettings?.enabled) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Shop is currently disabled</h1>
            <p className="text-slate-600">Ask admin to enable SHOP in the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div
        className="py-12"
        style={{
          background: 'linear-gradient(90deg, var(--color-header), var(--color-secondary), var(--color-header))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-white">
            <h1 className="text-4xl sm:text-5xl font-bold">SHOP</h1>
            <p className="text-white/90 mt-3 max-w-2xl">
              Explore our scout merchandise and support the group.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-slate-600">Categories</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => setActiveCategoryId('all')}
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                  activeCategoryId === 'all'
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategoryId(c.id)}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                    activeCategoryId === c.id
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-slate-600 text-sm">
              Showing <span className="font-semibold text-slate-900">{shownProducts.length}</span> product(s)
            </p>
          </div>
        </div>

        {shownProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-10 text-center">
            <p className="text-slate-700 font-semibold">No products found</p>
            <p className="text-slate-600 mt-2">Try another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shownProducts.map((p) => {
              const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : null;
              return (
                <article
                  key={p.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
                >
                  {img ? (
                    <div className="h-44 bg-slate-50 overflow-hidden">
                      <img src={img} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-44 bg-slate-50 flex items-center justify-center">
                      <div className="text-slate-400 text-sm">No Image</div>
                    </div>
                  )}

                  <div className="p-5">
                    <h2 className="text-lg font-bold text-slate-900">{p.name}</h2>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{p.description || '—'}</p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-slate-900 font-bold text-lg">Rs. {p.price}</div>
                      <div className="text-xs text-slate-500">
                        {(p.categoryId && categories.find((c) => c.id === p.categoryId)?.name) || 'Unassigned'}
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold py-2.5 rounded-lg transition"
                        onClick={() => {
                          alert('Demo: checkout/cart is not implemented yet.');
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

