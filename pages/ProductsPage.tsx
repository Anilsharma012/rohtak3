import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import type { Item } from '../types';
import ProductModal from '../components/ProductModal';

const ProductsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Item[] }>(`/api/items${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ''}`);
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    const base = items.filter(p => !s || p.name.toLowerCase().includes(s) || (p.salt||'').toLowerCase().includes(s) || (p.manufacturer||'').toLowerCase().includes(s));
    return base.filter(p => {
      if (stockStatusFilter === 'ALL') return true;
      if (stockStatusFilter === 'IN_STOCK') return (p.onHand||0) > (p.minStock||0);
      if (stockStatusFilter === 'LOW_STOCK') return (p.onHand||0) > 0 && (p.onHand||0) <= (p.minStock||0);
      if (stockStatusFilter === 'OUT_OF_STOCK') return (p.onHand||0) === 0;
      return true;
    });
  }, [items, searchTerm, stockStatusFilter]);

  const handleAddNew = () => { setEditing(null); setIsModalOpen(true); };
  const handleEdit = (item: Item) => { setEditing(item); setIsModalOpen(true); };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/api/items/${id}`);
    load();
  };

  const handleSave = async (payload: Partial<Item> & { _id?: string }) => {
    if (editing && editing._id) {
      await api.put(`/api/items/${editing._id}`, payload);
    } else {
      await api.post('/api/items', payload);
    }
    setIsModalOpen(false);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
        <div className="flex gap-2">
          <button onClick={handleAddNew} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700">Add New Product</button>
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name, salt, or manufacturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={load} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Search</button>
        <select
          value={stockStatusFilter}
          onChange={e => setStockStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="ALL">All</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Manufacturer</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">MRP</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-4" colSpan={5}>Loading...</td></tr>
              ) : filtered.map(p => (
                <tr key={p._id}>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap font-semibold">{p.name}</p>
                    <p className="text-gray-600 whitespace-no-wrap text-xs">{p.salt}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{p.manufacturer}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${(p.onHand||0) <= (p.minStock||0) ? 'text-red-900' : 'text-green-900'}`}>
                      <span aria-hidden className={`absolute inset-0 ${(p.onHand||0) <= (p.minStock||0) ? 'bg-red-200' : 'bg-green-200'} opacity-50 rounded-full`}></span>
                      <span className="relative">{p.onHand} {p.unit}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">₹{(p.mrp||0).toFixed(2)}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                    <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        productToEdit={editing}
      />
    </div>
  );
};

export default ProductsPage;
