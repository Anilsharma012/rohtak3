import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Batch, Product } from '../types';
import BatchModal from '../components/BatchModal';

const initialBatches: Batch[] = [
    { id: 'b1', productId: '1', productName: 'Calpol 500mg', batchNumber: 'CPL1001', expiryDate: '2025-12-31', purchasePrice: 20.00, mrp: 30.50, quantity: 80 },
    { id: 'b2', productId: '1', productName: 'Calpol 500mg', batchNumber: 'CPL1002', expiryDate: '2024-11-30', purchasePrice: 20.50, mrp: 30.50, quantity: 40 },
    { id: 'b3', productId: '2', productName: 'Cetzine 10mg', batchNumber: 'CTZ201A', expiryDate: '2026-05-31', purchasePrice: 14.00, mrp: 20.00, quantity: 95 },
    { id: 'b4', productId: '6', productName: 'Crocin Advance', batchNumber: 'CRCADV01', expiryDate: '2024-09-30', purchasePrice: 24.00, mrp: 35.00, quantity: 3 },
];

const BatchesPage: React.FC = () => {
    const [products] = useLocalStorage<Product[]>('products', []);
    const [batches, setBatches] = useLocalStorage<Batch[]>('batches', initialBatches);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [batchToEdit, setBatchToEdit] = useState<Batch | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expiryFilter, setExpiryFilter] = useState('ALL');

    const handleSaveBatch = (batch: Batch) => {
        if (batchToEdit) {
            setBatches(batches.map(b => b.id === batch.id ? batch : b));
        } else {
            setBatches([...batches, { ...batch, id: Date.now().toString() }]);
        }
        setIsModalOpen(false);
        setBatchToEdit(null);
    };

    const handleAddNew = () => {
        setBatchToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (batch: Batch) => {
        setBatchToEdit(batch);
        setIsModalOpen(true);
    };
    
    const handleDelete = (batchId: string) => {
        if (window.confirm('Are you sure you want to delete this batch?')) {
            setBatches(batches.filter(b => b.id !== batchId));
        }
    }
    
    const enrichedBatches = useMemo(() => batches.map(b => {
        const product = products.find(p => p.id === b.productId);
        return { ...b, productName: product?.name || 'Unknown Product' };
    }), [batches, products]);

    const isBatchNearExpiry = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);
        return expiry < threeMonthsFromNow;
    };

    const isBatchExpired = (expiryDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare with start of day
        const expiry = new Date(expiryDate);
        return expiry < today;
    };
    
    const filteredBatches = enrichedBatches.filter(b => {
        const matchesSearch = b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesExpiry = expiryFilter === 'ALL' ||
            (expiryFilter === 'NEAR_EXPIRY' && !isBatchExpired(b.expiryDate) && isBatchNearExpiry(b.expiryDate)) ||
            (expiryFilter === 'EXPIRED' && isBatchExpired(b.expiryDate));

        return matchesSearch && matchesExpiry;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Batches & Stock</h1>
                <div className="flex gap-2">
                    <button onClick={() => alert('Import functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Import</button>
                    <button onClick={() => alert('Export functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Export</button>
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
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBatches.map(batch => {
                                const isExpired = isBatchExpired(batch.expiryDate);
                                const isNearExpiry = !isExpired && isBatchNearExpiry(batch.expiryDate);

                                return (
                                <tr key={batch.id}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-semibold">{batch.productName}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{batch.batchNumber}</p>
                                    </td>
                                    <td className={`px-5 py-4 border-b border-gray-200 text-sm ${isExpired ? 'bg-red-100' : isNearExpiry ? 'bg-yellow-100' : 'bg-white'}`}>
                                        <p className={`${isExpired ? 'text-red-700 font-bold' : ''} ${isNearExpiry ? 'text-yellow-700 font-semibold' : ''} text-gray-900 whitespace-no-wrap`}>
                                            {batch.expiryDate}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{batch.quantity}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">₹{batch.mrp.toFixed(2)}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                        <button onClick={() => handleEdit(batch)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">Edit</button>
                                        <button onClick={() => handleDelete(batch.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <BatchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveBatch}
                batchToEdit={batchToEdit}
                products={products}
            />
        </div>
    );
};

export default BatchesPage;