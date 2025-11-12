import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Item } from '../types';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

interface GRNLine {
  productId: string;
  productName: string;
  batchNo: string;
  expiryDate: string;
  qty: number;
  freeQty: number;
  purchasePrice: number;
  mrp?: number;
  salePrice?: number;
}

const AddStockGRNPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [lines, setLines] = useState<Partial<GRNLine>[]>([{}]);
  const { toasts, success, error } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await api.get<any>('/api/items');
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load items');
    }
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    if (field === 'productId') {
      const selectedItem = items.find(i => i._id?.toString() === value);
      if (selectedItem) {
        newLines[index].productName = selectedItem.name;
        newLines[index].mrp = selectedItem.mrp;
      }
    }

    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, {}]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceNo.trim()) {
      error('Invoice number is required');
      return;
    }
    if (!invoiceDate) {
      error('Invoice date is required');
      return;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.productId) {
        error(`Line ${i + 1}: Please select a product`);
        return;
      }
      if (!line.batchNo) {
        error(`Line ${i + 1}: Batch number is required`);
        return;
      }
      if (!line.expiryDate) {
        error(`Line ${i + 1}: Expiry date is required`);
        return;
      }
      if (!line.qty || line.qty <= 0) {
        error(`Line ${i + 1}: Quantity must be greater than 0`);
        return;
      }
      if (line.purchasePrice === undefined || line.purchasePrice < 0) {
        error(`Line ${i + 1}: Purchase price is required`);
        return;
      }
    }

    setLoading(true);
    try {
      await api.post('/api/grn', {
        invoiceNo: invoiceNo.trim(),
        invoiceDate,
        vendor: vendor.trim() || undefined,
        lines: lines.map(line => ({
          productId: line.productId,
          batchNo: line.batchNo,
          expiryDate: line.expiryDate,
          qty: line.qty || 0,
          freeQty: line.freeQty || 0,
          purchasePrice: line.purchasePrice || 0,
          mrp: line.mrp,
          salePrice: line.salePrice,
        })),
      });

      success('GRN created successfully');
      setTimeout(() => {
        navigate('/batches');
      }, 1500);
    } catch (err: any) {
      error(err.message || 'Failed to create GRN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => {}}
        />
      ))}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add Stock (GRN)</h1>
        <p className="text-gray-600 mt-2">Create a Goods Received Note to add stock to your inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice No *</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g., INV-001"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date *</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Line Items</h2>
            <button
              type="button"
              onClick={addLine}
              className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              + Add Line
            </button>
          </div>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {lines.map((line, idx) => (
              <div key={idx} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-700">Line {idx + 1}</h3>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                    <select
                      value={line.productId || ''}
                      onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a product</option>
                      {items.map(item => (
                        <option key={item._id?.toString()} value={item._id?.toString()}>
                          {item.name} {item.sku ? `(${item.sku})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch No *</label>
                    <input
                      type="text"
                      value={line.batchNo || ''}
                      onChange={(e) => handleLineChange(idx, 'batchNo', e.target.value)}
                      placeholder="e.g., CPL1001"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                    <input
                      type="date"
                      value={line.expiryDate || ''}
                      onChange={(e) => handleLineChange(idx, 'expiryDate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qty *</label>
                    <input
                      type="number"
                      value={line.qty || ''}
                      onChange={(e) => handleLineChange(idx, 'qty', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="1"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Free Qty</label>
                    <input
                      type="number"
                      value={line.freeQty || ''}
                      onChange={(e) => handleLineChange(idx, 'freeQty', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="1"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price *</label>
                    <input
                      type="number"
                      value={line.purchasePrice ?? ''}
                      onChange={(e) => handleLineChange(idx, 'purchasePrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">MRP</label>
                    <input
                      type="number"
                      value={line.mrp ?? ''}
                      onChange={(e) => handleLineChange(idx, 'mrp', parseFloat(e.target.value) || undefined)}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
                    <input
                      type="number"
                      value={line.salePrice ?? ''}
                      onChange={(e) => handleLineChange(idx, 'salePrice', parseFloat(e.target.value) || undefined)}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() => navigate('/batches')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create GRN'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStockGRNPage;
