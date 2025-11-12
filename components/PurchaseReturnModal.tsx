import React, { useState, useEffect } from 'react';
import type { PurchaseReturn } from '../types';

interface PurchaseReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: PurchaseReturn) => void;
    returnToEdit: PurchaseReturn | null;
}

const emptyReturn: Omit<PurchaseReturn, 'id'> = {
    returnInvoiceNumber: '',
    originalPurchaseInvoice: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    reason: '',
};

const PurchaseReturnModal: React.FC<PurchaseReturnModalProps> = ({ isOpen, onClose, onSave, returnToEdit }) => {
    const [item, setItem] = useState<Omit<PurchaseReturn, 'id'>>({ ...emptyReturn });

    useEffect(() => {
        if (returnToEdit) {
            setItem(returnToEdit);
        } else {
            const newReturnNumber = `PR-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`;
            setItem({ ...emptyReturn, returnInvoiceNumber: newReturnNumber });
        }
    }, [returnToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: name === 'totalAmount' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...item,
            id: returnToEdit?.id || Date.now().toString(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{returnToEdit ? 'Edit Purchase Return' : 'Create New Purchase Return'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Return #</label>
                                <input type="text" name="returnInvoiceNumber" value={item.returnInvoiceNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100" readOnly />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Return Date</label>
                                <input type="date" name="date" value={item.date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Original Purchase Inv #</label>
                                <input type="text" name="originalPurchaseInvoice" value={item.originalPurchaseInvoice} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                                <input type="text" name="supplier" value={item.supplier} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Total Return Amount</label>
                            <input type="number" step="0.01" name="totalAmount" value={item.totalAmount} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Reason for Return</label>
                            <textarea name="reason" value={item.reason} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg mr-4 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700">Save Return</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseReturnModal;