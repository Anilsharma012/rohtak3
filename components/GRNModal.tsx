import React, { useState } from 'react';
import type { Item } from '../types';

interface GRNModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    itemId: string;
    itemName: string;
    batchNo: string;
    expiryDate: string;
    quantity: number;
    mrp?: number;
    purchasePrice?: number;
  }) => void;
  items: Item[];
}

const GRNModal: React.FC<GRNModalProps> = ({ isOpen, onClose, onSave, items }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mrp, setMrp] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedItem = items.find(i => i._id?.toString() === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedItemId) {
      setError('Please select an item');
      return;
    }
    if (!batchNo) {
      setError('Batch number is required');
      return;
    }
    if (!expiryDate) {
      setError('Expiry date is required');
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    onSave({
      itemId: selectedItemId,
      itemName: selectedItem?.name || '',
      batchNo,
      expiryDate,
      quantity: parseFloat(quantity),
      mrp: mrp ? parseFloat(mrp) : undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
    });

    setBatchNo('');
    setExpiryDate('');
    setQuantity('');
    setMrp('');
    setPurchasePrice('');
    setSelectedItemId('');
  };

  const handleClose = () => {
    setBatchNo('');
    setExpiryDate('');
    setQuantity('');
    setMrp('');
    setPurchasePrice('');
    setSelectedItemId('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              placeholder="e.g., CPL1001"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="1"
              min="1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
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
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GRNModal;
