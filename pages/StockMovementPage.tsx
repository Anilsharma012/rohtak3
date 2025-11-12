import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Item } from '../types';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

interface Movement {
  _id: string;
  type: 'adjust' | 'transfer';
  productId: string;
  productName: string;
  batchNo: string;
  fromBatchId?: string;
  toBatchId?: string;
  qty: number;
  reason: string;
  userId: string;
  createdAt: string;
}

const StockMovementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'adjust' | 'transfer'>('adjust');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, success, error } = useToast();

  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    batchNo: '',
    delta: 0,
    reason: '',
  });

  const [transferForm, setTransferForm] = useState({
    productId: '',
    fromBatchNo: '',
    qty: 0,
    toBatchNo: '',
    createNewBatch: false,
    newBatchNo: '',
    newExpiryDate: '',
    reason: '',
  });

  useEffect(() => {
    loadItems();
    loadMovements();
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

  const loadMovements = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/stock-movements?limit=100');
      if (res.success && res.data?.rows) {
        setMovements(res.data.rows);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load movements');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adjustForm.productId) {
      error('Please select a product');
      return;
    }
    if (!adjustForm.batchNo) {
      error('Please select a batch');
      return;
    }
    if (adjustForm.delta === 0) {
      error('Delta must not be zero');
      return;
    }
    if (!adjustForm.reason.trim()) {
      error('Reason is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/stock-movements', {
        type: 'adjust',
        productId: adjustForm.productId,
        batchNo: adjustForm.batchNo,
        delta: adjustForm.delta,
        reason: adjustForm.reason.trim(),
      });

      success(`Stock adjusted by ${adjustForm.delta} units`);
      setAdjustForm({ productId: '', batchNo: '', delta: 0, reason: '' });
      await loadMovements();
    } catch (err: any) {
      error(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transferForm.productId) {
      error('Please select a product');
      return;
    }
    if (!transferForm.fromBatchNo) {
      error('Please select from batch');
      return;
    }
    if (transferForm.qty <= 0) {
      error('Quantity must be greater than 0');
      return;
    }
    if (!transferForm.reason.trim()) {
      error('Reason is required');
      return;
    }

    if (transferForm.createNewBatch) {
      if (!transferForm.newBatchNo.trim()) {
        error('New batch number is required');
        return;
      }
      if (!transferForm.newExpiryDate) {
        error('New batch expiry date is required');
        return;
      }
    } else {
      if (!transferForm.toBatchNo) {
        error('Please select to batch');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: any = {
        type: 'transfer',
        productId: transferForm.productId,
        fromBatchId: transferForm.fromBatchNo,
        qty: transferForm.qty,
        reason: transferForm.reason.trim(),
      };

      if (transferForm.createNewBatch) {
        payload.toBatch = {
          batchNo: transferForm.newBatchNo.trim(),
          expiryDate: transferForm.newExpiryDate,
        };
      } else {
        payload.toBatchId = transferForm.toBatchNo;
      }

      await api.post('/api/stock-movements', payload);

      success(`${transferForm.qty} units transferred`);
      setTransferForm({
        productId: '',
        fromBatchNo: '',
        qty: 0,
        toBatchNo: '',
        createNewBatch: false,
        newBatchNo: '',
        newExpiryDate: '',
        reason: '',
      });
      await loadMovements();
    } catch (err: any) {
      error(err.message || 'Failed to transfer stock');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItem = items.find(i => i._id === adjustForm.productId || i._id === transferForm.productId);
  const adjustBatches = adjustForm.productId 
    ? items.find(i => i._id === adjustForm.productId)?.batches || [] 
    : [];
  const transferBatches = transferForm.productId 
    ? items.find(i => i._id === transferForm.productId)?.batches || [] 
    : [];

  const getMovementTypeColor = (type: string) => {
    return type === 'adjust' 
      ? 'bg-yellow-100 text-yellow-800' 
      : 'bg-blue-100 text-blue-800';
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

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Stock Movement</h1>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="mb-6">
            <div className="flex gap-4 border-b border-gray-300">
              <button
                onClick={() => setActiveTab('adjust')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'adjust'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                Adjustment
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'transfer'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                Transfer
              </button>
            </div>
          </div>

          {activeTab === 'adjust' && (
            <form onSubmit={handleAdjustSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Stock Adjustment</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                  <select
                    value={adjustForm.productId}
                    onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value, batchNo: '' })}
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

                {adjustBatches.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch *</label>
                    <select
                      value={adjustForm.batchNo}
                      onChange={(e) => setAdjustForm({ ...adjustForm, batchNo: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a batch</option>
                      {adjustBatches.map(batch => (
                        <option key={batch.batchNo} value={batch.batchNo}>
                          {batch.batchNo} (Qty: {batch.onHand})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delta (±) *</label>
                  <input
                    type="number"
                    value={adjustForm.delta}
                    onChange={(e) => setAdjustForm({ ...adjustForm, delta: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 5 or -2"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <textarea
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    placeholder="e.g., Damaged stock, Inventory correction"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {submitting ? 'Adjusting...' : 'Adjust Stock'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'transfer' && (
            <form onSubmit={handleTransferSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Batch Transfer</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                  <select
                    value={transferForm.productId}
                    onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value, fromBatchNo: '' })}
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

                {transferBatches.length > 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Batch *</label>
                      <select
                        value={transferForm.fromBatchNo}
                        onChange={(e) => setTransferForm({ ...transferForm, fromBatchNo: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select from batch</option>
                        {transferBatches.map(batch => (
                          <option key={batch.batchNo} value={batch.batchNo}>
                            {batch.batchNo} (Qty: {batch.onHand})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        value={transferForm.qty}
                        onChange={(e) => setTransferForm({ ...transferForm, qty: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                        <input
                          type="checkbox"
                          checked={transferForm.createNewBatch}
                          onChange={(e) => setTransferForm({ ...transferForm, createNewBatch: e.target.checked })}
                          className="mr-2"
                        />
                        Create new batch for transfer
                      </label>
                    </div>

                    {transferForm.createNewBatch ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Batch No *</label>
                          <input
                            type="text"
                            value={transferForm.newBatchNo}
                            onChange={(e) => setTransferForm({ ...transferForm, newBatchNo: e.target.value })}
                            placeholder="e.g., CPL2001"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                          <input
                            type="date"
                            value={transferForm.newExpiryDate}
                            onChange={(e) => setTransferForm({ ...transferForm, newExpiryDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Batch *</label>
                        <select
                          value={transferForm.toBatchNo}
                          onChange={(e) => setTransferForm({ ...transferForm, toBatchNo: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select to batch</option>
                          {transferBatches.map(batch => (
                            <option key={batch.batchNo} value={batch.batchNo}>
                              {batch.batchNo} (Qty: {batch.onHand})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                      <textarea
                        value={transferForm.reason}
                        onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                        placeholder="e.g., Consolidation, Repackaging"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {submitting ? 'Processing...' : 'Transfer Stock'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Movement History</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : movements.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg">No movements yet</div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {movements.map(move => (
                  <div key={move._id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{move.productName}</p>
                        <p className="text-sm text-gray-600">Batch: {move.batchNo}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getMovementTypeColor(move.type)}`}>
                        {move.type === 'adjust' ? 'Adjustment' : 'Transfer'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">Qty: <span className="font-semibold">{move.qty}</span></p>
                    <p className="text-sm text-gray-600 mb-1">{move.reason}</p>
                    <p className="text-xs text-gray-400">{new Date(move.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockMovementPage;
