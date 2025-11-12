import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Item } from '../types';
import BatchModal from '../components/BatchModal';
import GRNModal from '../components/GRNModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

interface BatchRow {
  _id: string;
  itemId: string;
  itemName: string;
  sku?: string;
  manufacturer?: string;
  batchNo: string;
  expiryDate?: Date;
  onHand: number;
  mrp?: number;
  purchasePrice?: number;
  salePrice?: number;
}

const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGRNOpen, setIsGRNOpen] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState<BatchRow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const { toasts, success, error } = useToast();

  const loadBatches = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await api.get<any>(`/api/batches?page=${page}&limit=50&expiry=${expiryFilter}${searchTerm ? `&q=${searchTerm}` : ''}`);
      if (res.success && res.data?.rows) {
        setBatches(res.data.rows);
        setCurrentPage(res.data.pagination?.page || 1);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalRecords(res.data.pagination?.total || 0);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadItems();
    loadBatches();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    loadBatches(1);
  }, [searchTerm, expiryFilter]);

  const handleSaveBatch = async (batch: any) => {
    try {
      if (batchToEdit) {
        await api.put(`/api/items/batches/${batchToEdit._id}`, {
          mrp: batch.mrp,
          purchasePrice: batch.purchasePrice,
          salePrice: batch.salePrice,
          expiryDate: batch.expiryDate,
        });
        success('Batch updated successfully');
      }
      setIsModalOpen(false);
      setBatchToEdit(null);
      await loadBatches(currentPage);
    } catch (err: any) {
      error(err.message || 'Failed to save batch');
    }
  };

  const handleAddNew = () => {
    setBatchToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (batch: BatchRow) => {
    setBatchToEdit(batch);
    setIsModalOpen(true);
  };

  const handleDelete = async (batch: BatchRow) => {
    if (!window.confirm(`Delete batch ${batch.batchNo}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/api/items/batches/${batch._id}`);
      success('Batch deleted successfully');
      await loadBatches(currentPage);
    } catch (err: any) {
      error(err.message || 'Failed to delete batch');
    }
  };

  const handleGRNSave = async (data: any) => {
    try {
      await api.post('/api/grn', {
        invoiceNo: data.invoiceNo,
        invoiceDate: data.invoiceDate,
        vendor: data.vendor,
        lines: [{
          productId: data.itemId,
          batchNo: data.batchNo,
          expiryDate: data.expiryDate,
          qty: data.quantity,
          freeQty: data.freeQty || 0,
          purchasePrice: data.purchasePrice || 0,
          mrp: data.mrp,
          salePrice: data.salePrice,
        }],
      });
      success('Stock added successfully');
      setIsGRNOpen(false);
      setCurrentPage(1);
      await loadBatches(1);
    } catch (err: any) {
      error(err.message || 'Failed to add stock');
    }
  };

  const isBatchNearExpiry = (expiryDate?: Date) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    return expiry <= futureDate && expiry > today;
  };

  const isBatchExpired = (expiryDate?: Date) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    return expiry < today;
  };

  const convertBatchToFormData = (batch: BatchRow) => ({
    productId: batch.itemId,
    batchNumber: batch.batchNo,
    expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : '',
    purchasePrice: batch.purchasePrice || 0,
    salePrice: batch.salePrice,
    mrp: batch.mrp || 0,
    quantity: batch.onHand,
  });

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

      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Batches & Stock</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsGRNOpen(true)}
            className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Add Stock (GRN)
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by product name, SKU, manufacturer, or batch number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={expiryFilter}
          onChange={e => setExpiryFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Expiry Status</option>
          <option value="valid">Valid</option>
          <option value="expiringSoon">Expiring Soon (90 days)</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : batches.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg">No batches found</div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch No.</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">MRP</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purchase Price</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => {
                    const isExpired = isBatchExpired(batch.expiryDate);
                    const isNearExpiry = isBatchNearExpiry(batch.expiryDate);
                    const expiryDateStr = batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : 'N/A';

                    return (
                      <tr key={batch._id}>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-nowrap font-semibold">{batch.itemName}</p>
                          {batch.sku && <p className="text-gray-500 whitespace-nowrap text-xs">SKU: {batch.sku}</p>}
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-nowrap">{batch.batchNo}</p>
                        </td>
                        <td className={`px-5 py-4 border-b border-gray-200 text-sm ${isExpired ? 'bg-red-100' : isNearExpiry ? 'bg-yellow-100' : 'bg-white'}`}>
                          <p className={`${isExpired ? 'text-red-700 font-bold' : ''} ${isNearExpiry ? 'text-yellow-700 font-semibold' : ''} text-gray-900 whitespace-nowrap`}>
                            {expiryDateStr}
                          </p>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-nowrap font-semibold">{batch.onHand}</p>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-nowrap">₹{batch.mrp ? batch.mrp.toFixed(2) : '0.00'}</p>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-nowrap">₹{batch.purchasePrice ? batch.purchasePrice.toFixed(2) : '0.00'}</p>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                          <button 
                            onClick={() => handleEdit(batch)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(batch)}
                            className="text-red-600 hover:text-red-900 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => loadBatches(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages} ({totalRecords} total)
              </span>
              <button
                onClick={() => loadBatches(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <BatchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBatchToEdit(null);
        }}
        onSave={handleSaveBatch}
        batchToEdit={batchToEdit ? convertBatchToFormData(batchToEdit) : null}
        products={items}
      />

      <GRNModal
        isOpen={isGRNOpen}
        onClose={() => setIsGRNOpen(false)}
        onSave={handleGRNSave}
        items={items}
      />
    </div>
  );
};

export default BatchesPage;
