import { useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, Package, Tag, Settings as SettingsIcon } from 'lucide-react';
import {
  getShopSettings,
  updateShopSettings,
  getShopCategories,
  addShopCategory,
  updateShopCategory,
  deleteShopCategory,
  getShopProducts,
  addShopProduct,
  updateShopProduct,
  deleteShopProduct,
} from '../utils/dataManager';

function readFilesAsDataUrls(fileList) {
  return new Promise((resolve) => {
    const files = Array.from(fileList || []);
    if (!files.length) return resolve([]);

    const reads = files.map(
      (file) =>
        new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res({ name: file.name, dataUrl: String(reader.result || '') });
          reader.onerror = () => res({ name: file.name, dataUrl: '' });
          reader.readAsDataURL(file);
        })
    );

    Promise.all(reads).then((arr) => resolve(arr.filter((x) => x.dataUrl)));
  });
}

export default function AdminShopSettings() {
  const categories = useMemo(() => getShopCategories(), []);
  const [shopSettings, setLocalShopSettings] = useState(() => getShopSettings());

  const [categoryDraft, setCategoryDraft] = useState({ name: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [productDraft, setProductDraft] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    images: [], // array of dataUrl strings
  });
  const [editingProductId, setEditingProductId] = useState(null);

  const fileInputRef = useRef(null);

  const [forceRerender, setForceRerender] = useState(0);
  const refresh = () => setForceRerender((x) => x + 1);

  const liveCategories = useMemo(() => getShopCategories(), [forceRerender]);
  const liveProducts = useMemo(() => getShopProducts(), [forceRerender]);

  const handleToggleEnabled = (enabled) => {
    const next = { ...shopSettings, enabled };
    setLocalShopSettings(next);
    updateShopSettings(next);
  };

  const handleAddOrSaveCategory = () => {
    const name = (categoryDraft.name || '').trim();
    if (!name) return alert('Category name is required');

    if (editingCategoryId) {
      const updated = updateShopCategory(editingCategoryId, { name });
      if (!updated) alert('Category not found');
    } else {
      addShopCategory({ name });
    }

    setCategoryDraft({ name: '' });
    setEditingCategoryId(null);
    refresh();
  };

  const startEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryDraft({ name: cat.name || '' });
  };

  const handleDeleteCategory = (catId) => {
    if (!confirm('Delete this category? Products in this category will remain but show as unassigned.')) return;
    deleteShopCategory(catId);
    if (productDraft.categoryId === catId) {
      setProductDraft((p) => ({ ...p, categoryId: '' }));
    }
    refresh();
  };

  const handlePickImages = async (files) => {
    const dataItems = await readFilesAsDataUrls(files);
    const dataUrls = dataItems.map((x) => x.dataUrl);
    setProductDraft((p) => ({ ...p, images: [...(p.images || []), ...dataUrls].slice(0, 5) }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetProductDraft = () => {
    setEditingProductId(null);
    setProductDraft({ name: '', price: '', categoryId: '', description: '', images: [] });
  };

  const startEditProduct = (p) => {
    setEditingProductId(p.id);
    setProductDraft({
      name: p.name || '',
      price: p.price != null ? String(p.price) : '',
      categoryId: p.categoryId || '',
      description: p.description || '',
      images: Array.isArray(p.images) ? p.images : [],
    });
  };

  const handleAddOrSaveProduct = () => {
    const name = (productDraft.name || '').trim();
    const priceNum = Number(productDraft.price);
    if (!name) return alert('Product name is required');
    if (Number.isNaN(priceNum) || priceNum < 0) return alert('Valid price is required');

    const payload = {
      name,
      price: priceNum,
      categoryId: productDraft.categoryId || '',
      description: productDraft.description || '',
      images: Array.isArray(productDraft.images) ? productDraft.images : [],
    };

    if (editingProductId) {
      const updated = updateShopProduct(editingProductId, payload);
      if (!updated) alert('Product not found');
    } else {
      addShopProduct(payload);
    }

    resetProductDraft();
    refresh();
  };

  const handleDeleteProduct = (productId) => {
    if (!confirm('Delete this product?')) return;
    deleteShopProduct(productId);
    refresh();
    if (editingProductId === productId) resetProductDraft();
  };

  const categoryLabelById = (id) => {
    const c = liveCategories.find((x) => x.id === id);
    return c ? c.name : 'Unassigned';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-slate-700" />
          Shop Settings
        </h2>
        <p className="text-slate-600">Enable the shop, manage categories, and add products with images.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">Shop Visibility</p>
                <p className="text-slate-600 text-sm mt-1">If disabled, public SHOP page will be hidden.</p>
              </div>
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!shopSettings.enabled}
                  onChange={(e) => handleToggleEnabled(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <Package className="w-5 h-5 text-slate-700" />
              <div>
                <p className="text-sm text-slate-700 font-semibold">Products</p>
                <p className="text-xs text-slate-600">{liveProducts.length} total</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-slate-700 font-semibold">Categories</p>
                <p className="text-xs text-slate-600">{liveCategories.length} total</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-slate-700" />
                  <h3 className="font-semibold text-slate-900">Categories</h3>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category name</label>
                  <input
                    value={categoryDraft.name}
                    onChange={(e) => setCategoryDraft({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. Uniforms"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddOrSaveCategory}
                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold px-4 py-2 rounded-lg transition w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    {editingCategoryId ? 'Save Category' : 'Add Category'}
                  </button>
                  {editingCategoryId ? (
                    <button
                      onClick={() => {
                        setEditingCategoryId(null);
                        setCategoryDraft({ name: '' });
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-lg transition"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 space-y-2">
                  {liveCategories.length === 0 ? (
                    <p className="text-sm text-slate-600">No categories yet.</p>
                  ) : (
                    liveCategories.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">{cat.name}</p>
                          <p className="text-xs text-slate-600">ID: {cat.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditCategory(cat)}
                            className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-700" />
                  <h3 className="font-semibold text-slate-900">Products</h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input
                      value={productDraft.name}
                      onChange={(e) => setProductDraft((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="e.g. Scout T-Shirt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                    <input
                      value={productDraft.price}
                      onChange={(e) => setProductDraft((p) => ({ ...p, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="e.g. 1200"
                      inputMode="decimal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={productDraft.categoryId}
                    onChange={(e) => setProductDraft((p) => ({ ...p, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">Unassigned</option>
                    {liveCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={productDraft.description}
                    onChange={(e) => setProductDraft((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Short product description"
                  />
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-5 h-5 text-slate-700" />
                    <p className="font-semibold text-slate-900 text-sm">Images</p>
                    <p className="text-xs text-slate-600">(max 5 images)</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePickImages(e.target.files)}
                    className="block w-full text-sm text-slate-600"
                  />

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(productDraft.images || []).map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt={`Product image ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border border-slate-200" />
                        <button
                          onClick={() =>
                            setProductDraft((p) => ({
                              ...p,
                              images: (p.images || []).filter((_, i) => i !== idx),
                            }))
                          }
                          className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 hover:bg-slate-50"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddOrSaveProduct}
                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold px-4 py-2 rounded-lg transition w-full justify-center"
                  >
                    <Save className="w-4 h-4" />
                    {editingProductId ? 'Save Product' : 'Add Product'}
                  </button>
                  {editingProductId ? (
                    <button
                      onClick={resetProductDraft}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-lg transition"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-slate-900">Existing Products</h4>
                {liveProducts.length === 0 ? (
                  <p className="text-sm text-slate-600">No products yet.</p>
                ) : (
                  liveProducts.map((p) => (
                    <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                          {Array.isArray(p.images) && p.images[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-slate-500">No image</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          <p className="text-sm text-slate-700">Price: {p.price}</p>
                          <p className="text-xs text-slate-600">Category: {categoryLabelById(p.categoryId)}</p>
                          {p.description ? <p className="text-xs text-slate-600 mt-1 line-clamp-2">{p.description}</p> : null}
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
        <p className="font-semibold mb-2">Note</p>
        <p>
          Images are stored in your browser’s localStorage as Data URLs. For production-grade media storage,
          you’d typically upload to a storage provider.
        </p>
      </div>
    </div>
  );
}

