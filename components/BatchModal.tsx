import React, { useState, useEffect } from 'react';
import type { Item } from '../types';

interface BatchFormData {
    productId: string;
    batchNumber: string;
    expiryDate: string;
    purchasePrice: number;
    mrp: number;
    quantity: number;
}

interface BatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (batch: BatchFormData) => void;
    batchToEdit: BatchFormData | null;
    products: Item[];
}

const emptyBatch: BatchFormData = {
    productId: '',
    batchNumber: '',
    expiryDate: '',
    purchasePrice: 0,
    mrp: 0,
    quantity: 0,
};

const BatchModal: React.FC<BatchModalProps> = ({ isOpen, onClose, onSave, batchToEdit, products }) => {
    const [batch, setBatch] = useState<BatchFormData>({ ...emptyBatch });
    const [error, setError] = useState('');

    useEffect(() => {
        if (batchToEdit) {
            setBatch(batchToEdit);
        } else {
            setBatch({ ...emptyBatch });
        }
        setError('');
    }, [batchToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let finalValue: string | number = value;
        if (['purchasePrice', 'mrp', 'quantity'].includes(name)) {
            finalValue = parseFloat(value) || 0;
        }
        setBatch(prev => ({ ...prev, [name]: finalValue }));
    };
    
    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedProduct = products.find(p => p.id === e.target.value);
        if (selectedProduct) {
             setBatch(prev => ({
                ...prev,
                productId: selectedProduct.id,
                mrp: selectedProduct.mrp // Auto-fill MRP from product
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!batch.productId) {
            alert('Please select a product.');
            return;
        }
        onSave({
            ...batch,
            id: batchToEdit?.id || Date.now().toString(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{batchToEdit ? 'Edit Batch' : 'Add New Batch'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product</label>
                            <select name="productId" value={batch.productId} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                                <option value="">Select a product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                            <input type="text" name="batchNumber" value={batch.batchNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="date" name="expiryDate" value={batch.expiryDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                         <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input type="number" name="quantity" value={batch.quantity} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                                <input type="number" step="0.01" name="purchasePrice" value={batch.purchasePrice} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">MRP</label>
                                <input type="number" step="0.01" name="mrp" value={batch.mrp} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg mr-4 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700">Save Batch</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchModal;
