import React, { useState } from 'react';
import type { Item } from '../types';

interface GRNLine {
  itemId: string;
  itemName: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  freeQty: number;
  purchasePrice: number;
  mrp?: number;
  salePrice?: number;
}

interface GRNModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  items: Item[];
}

const GRNModal: React.FC<GRNModalProps> = ({ isOpen, onClose, onSave, items }) => {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [lines, setLines] = useState<Partial<GRNLine>[]>([{}]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    if (field === 'itemId') {
      const selectedItem = items.find(i => i._id?.toString() === value);
      if (selectedItem) {
        newLines[index].itemName = selectedItem.name;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!invoiceNo.trim()) {
      setError('Invoice number is required');
      return;
    }
    if (!invoiceDate) {
      setError('Invoice date is required');
      return;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.itemId) {
        setError(`Line ${i + 1}: Please select a product`);
        return;
      }
      if (!line.batchNo) {
        setError(`Line ${i + 1}: Batch number is required`);
        return;
      }
      if (!line.expiryDate) {
        setError(`Line ${i + 1}: Expiry date is required`);
        return;
      }
      if (!line.quantity || line.quantity <= 0) {
        setError(`Line ${i + 1}: Quantity must be greater than 0`);
        return;
      }
      if (line.purchasePrice === undefined || line.purchasePrice < 0) {
        setError(`Line ${i + 1}: Purchase price is required`);
        return;
      }
    }

    onSave({
      invoiceNo: invoiceNo.trim(),
      invoiceDate,
      vendor: vendor.trim() || undefined,
      lines: lines.map(line => ({
        itemId: line.itemId,
        batchNo: line.batchNo,
        expiryDate: line.expiryDate,
        quantity: line.quantity || 0,
        freeQty: line.freeQty || 0,
        purchasePrice: line.purchasePrice || 0,
        mrp: line.mrp,
        salePrice: line.salePrice,
      })),
    });

    setInvoiceNo('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setVendor('');
    setLines([{}]);
  };

  const handleClose = () => {
    setInvoiceNo('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setVendor('');
    setLines([{}]);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Stock (GRN)</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No *</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g., INV-001"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Line Items</h3>
              <button
                type="button"
                onClick={addLine}
                className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Line
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {lines.map((line, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                      <select
                        value={line.itemId || ''}
                        onChange={(e) => handleLineChange(idx, 'itemId', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a product</option>
                        {items.map(item => (
                          <option key={item._id?.toString()} value={item._id?.toString()}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Batch No *</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                      <input
                        type="date"
                        value={line.expiryDate || ''}
                        onChange={(e) => handleLineChange(idx, 'expiryDate', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qty *</label>
                      <input
                        type="number"
                        value={line.quantity || ''}
                        onChange={(e) => handleLineChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="1"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Free Qty</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
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
                  </div>

                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove Line
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 font-medium"
            >
              Create GRN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GRNModal;
