import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Item } from '../types';
import BatchModal from '../components/BatchModal';
import GRNModal from '../components/GRNModal';

interface BatchRow {
    _id: string;
    itemId: string;
    itemName: string;
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
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expiryFilter, setExpiryFilter] = useState('ALL');
    const [error, setError] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const itemsRes = await api.get<{ success: boolean; data: Item[] }>('/api/items');
            setItems(itemsRes.data || []);

            const batchesRes = await api.get<{ success: boolean; data: BatchRow[] }>('/api/items/batches/list');
            setBatches(batchesRes.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveBatch = async (batch: any) => {
        setError('');
        try {
            if (batchToEdit && selectedItemId) {
                await api.put(`/api/items/${selectedItemId}/batches`, {
                    batchNo: batch.batchNumber,
                    expiryDate: batch.expiryDate,
                    onHand: batch.quantity,
                    mrp: batch.mrp,
                    purchasePrice: batch.purchasePrice,
                    salePrice: batch.salePrice,
                });
            } else if (selectedItemId) {
                await api.post(`/api/items/${selectedItemId}/batches`, {
                    batchNo: batch.batchNumber,
                    expiryDate: batch.expiryDate,
                    onHand: batch.quantity,
                    mrp: batch.mrp,
                    purchasePrice: batch.purchasePrice,
                    salePrice: batch.salePrice,
                });
            }
            setIsModalOpen(false);
            setBatchToEdit(null);
            setSelectedItemId(null);
            await loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to save batch');
        }
    };

    const handleAddNew = () => {
        setBatchToEdit(null);
        setSelectedItemId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (batch: BatchRow) => {
        setBatchToEdit(batch);
        setSelectedItemId(batch.itemId);
        setIsModalOpen(true);
    };

    const handleDelete = async (batch: BatchRow) => {
        if (!window.confirm(`Delete batch ${batch.batchNo}?`)) return;
        setError('');
        try {
            await api.post(`/api/items/${batch.itemId}/batches/delete`, { batchNo: batch.batchNo });
            await loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to delete batch');
        }
    };

    const handleOpenGRN = () => {
        setIsGRNOpen(true);
    };

    const handleGRNSave = async (data: any) => {
        setError('');
        try {
            await api.post(`/api/items/${data.itemId}/batches`, {
                batchNo: data.batchNo,
                expiryDate: data.expiryDate,
                onHand: data.quantity,
                mrp: data.mrp || 0,
                purchasePrice: data.purchasePrice || 0,
            });
            setIsGRNOpen(false);
            await loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to add GRN');
        }
    };

    const isBatchNearExpiry = (expiryDate?: Date) => {
        if (!expiryDate) return false;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);
        return expiry < threeMonthsFromNow && expiry > today;
    };

    const isBatchExpired = (expiryDate?: Date) => {
        if (!expiryDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);
        return expiry < today;
    };

    const filteredBatches = batches.filter(b => {
        const matchesSearch = b.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.batchNo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesExpiry = expiryFilter === 'ALL' ||
            (expiryFilter === 'NEAR_EXPIRY' && isBatchNearExpiry(b.expiryDate)) ||
            (expiryFilter === 'EXPIRED' && isBatchExpired(b.expiryDate));

        return matchesSearch && matchesExpiry;
    });

    const convertBatchToFormData = (batch: BatchRow) => ({
        productId: batch.itemId,
        batchNumber: batch.batchNo,
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : '',
        purchasePrice: batch.purchasePrice || 0,
        mrp: batch.mrp || 0,
        quantity: batch.onHand,
    });

    return (
        <div>
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Batches & Stock</h1>
                <div className="flex gap-2">
                    <button onClick={handleOpenGRN} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Add Stock (GRN)</button>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700"
                    >
                        Add New Batch
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Search by product name or batch number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-2/3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div>
                    <label htmlFor="expiry-filter" className="sr-only">Filter by expiry</label>
                    <select
                        id="expiry-filter"
                        value={expiryFilter}
                        onChange={e => setExpiryFilter(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Expiry Status</option>
                        <option value="NEAR_EXPIRY">Expiring Soon (3 months)</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
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
                                {filteredBatches.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-8 border-b border-gray-200 bg-white text-center text-gray-500">
                                            No batches found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBatches.map(batch => {
                                        const isExpired = isBatchExpired(batch.expiryDate);
                                        const isNearExpiry = isBatchNearExpiry(batch.expiryDate);
                                        const expiryDateStr = batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : 'N/A';

                                        return (
                                            <tr key={batch._id}>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                    <p className="text-gray-900 whitespace-no-wrap font-semibold">{batch.itemName}</p>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                    <p className="text-gray-900 whitespace-no-wrap">{batch.batchNo}</p>
                                                </td>
                                                <td className={`px-5 py-4 border-b border-gray-200 text-sm ${isExpired ? 'bg-red-100' : isNearExpiry ? 'bg-yellow-100' : 'bg-white'}`}>
                                                    <p className={`${isExpired ? 'text-red-700 font-bold' : ''} ${isNearExpiry ? 'text-yellow-700 font-semibold' : ''} text-gray-900 whitespace-no-wrap`}>
                                                        {expiryDateStr}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                    <p className="text-gray-900 whitespace-no-wrap">{batch.onHand}</p>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                    <p className="text-gray-900 whitespace-no-wrap">₹{batch.mrp ? batch.mrp.toFixed(2) : '0.00'}</p>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                    <p className="text-gray-900 whitespace-no-wrap">₹{batch.purchasePrice ? batch.purchasePrice.toFixed(2) : '0.00'}</p>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                                    <button onClick={() => handleEdit(batch)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">Edit</button>
                                                    <button onClick={() => handleDelete(batch)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <BatchModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setBatchToEdit(null);
                    setSelectedItemId(null);
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
