import React, { useState, useEffect } from 'react';
import type { Sale } from '../types';

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sale: Sale) => void;
    saleToEdit: Sale | null;
}

const emptySale: Omit<Sale, 'id'> = {
    billNumber: '',
    customerName: 'Walk-in Customer',
    date: new Date().toISOString().split('T')[0], // Today's date
    totalAmount: 0,
    // FIX: Add missing 'items' property to match the Sale type.
    items: [],
};

const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, onSave, saleToEdit }) => {
    const [sale, setSale] = useState<Omit<Sale, 'id'>>({ ...emptySale });

    useEffect(() => {
        if (saleToEdit) {
            setSale(saleToEdit);
        } else {
            setSale({ ...emptySale });
        }
    }, [saleToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSale(prev => ({ ...prev, [name]: name === 'totalAmount' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...sale,
            id: saleToEdit?.id || Date.now().toString(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{saleToEdit ? 'Edit Sale' : 'Create New Bill'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bill Number</label>
                            <input type="text" name="billNumber" value={sale.billNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                            <input type="text" name="customerName" value={sale.customerName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Bill Date</label>
                                <input type="date" name="date" value={sale.date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                                <input type="number" step="0.01" name="totalAmount" value={sale.totalAmount} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg mr-4 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700">Save Bill</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaleModal;
