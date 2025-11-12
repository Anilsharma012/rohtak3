import React, { useState, useEffect } from 'react';

interface BatchFormData {
  batchNumber: string;
  expiryDate: string;
  purchasePrice: number;
  salePrice?: number;
  mrp: number;
  quantity: number;
}

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (batch: BatchFormData) => void;
  batchToEdit: BatchFormData | null;
  products?: any[];
}

const BatchModal: React.FC<BatchModalProps> = ({ isOpen, onClose, onSave, batchToEdit }) => {
  const [batch, setBatch] = useState<BatchFormData>({ 
    batchNumber: '',
    expiryDate: '',
    purchasePrice: 0,
    mrp: 0,
    quantity: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (batchToEdit) {
      setBatch(batchToEdit);
    }
    setError('');
  }, [batchToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue: string | number = value;
    if (['purchasePrice', 'mrp', 'salePrice'].includes(name)) {
      finalValue = parseFloat(value) || 0;
    }
    setBatch(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!batch.batchNumber) {
      setError('Batch number is required.');
      return;
    }
    if (!batch.expiryDate) {
      setError('Expiry date is required.');
      return;
    }

    onSave(batch);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Batch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number (Read-only)</label>
              <input
                type="text"
                name="batchNumber"
                value={batch.batchNumber}
                disabled
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={batch.expiryDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Read-only)</label>
              <input
                type="number"
                name="quantity"
                value={batch.quantity}
                disabled
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="purchasePrice"
                  value={batch.purchasePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                <input
                  type="number"
                  step="0.01"
                  name="mrp"
                  value={batch.mrp}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="salePrice"
                  value={batch.salePrice || ''}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchModal;
