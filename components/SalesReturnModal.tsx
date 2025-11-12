import React, { useState, useEffect, useMemo } from 'react';
import type { SalesReturn, BillItem, Product, Batch } from '../types';

interface SalesReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: SalesReturn) => void;
    returnToEdit: SalesReturn | null;
    products: Product[];
    batches: Batch[];
}

const emptyReturn: Omit<SalesReturn, 'id'> = {
    returnInvoiceNumber: '',
    originalBillNumber: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    reason: '',
    items: [],
};

const SalesReturnModal: React.FC<SalesReturnModalProps> = ({ isOpen, onClose, onSave, returnToEdit, products, batches }) => {
    const [item, setItem] = useState<Omit<SalesReturn, 'id'>>({ ...emptyReturn });
    const [searchTerm, setSearchTerm] = useState('');

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, products]);
    
    const totalAmount = useMemo(() => item.items.reduce((sum, i) => sum + i.total, 0), [item.items]);

    useEffect(() => {
        if (returnToEdit) {
            setItem(returnToEdit);
        } else {
            const newReturnNumber = `RTN-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`;
            setItem({ ...emptyReturn, returnInvoiceNumber: newReturnNumber });
        }
    }, [returnToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = (product: Product) => {
        const productBatches = batches.filter(b => b.productId === product.id);
        if (productBatches.length === 0) {
            alert(`No batches found for ${product.name}`);
            return;
        }
        // For simplicity, let's assume we return to the first available batch. A more complex UI could allow choosing.
        const batchToReturn = productBatches[0];
        const newItem: BillItem = {
            productId: product.id, productName: product.name, batchId: batchToReturn.id,
            batchNumber: batchToReturn.batchNumber, quantity: 1, mrp: batchToReturn.mrp, total: batchToReturn.mrp
        };
        setItem(prev => ({...prev, items: [...prev.items, newItem]}));
        setSearchTerm('');
    };
    
    const handleQuantityChange = (batchId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setItem(prev => ({
            ...prev,
            items: prev.items.map(i => i.batchId === batchId ? {...i, quantity: newQuantity, total: newQuantity * i.mrp} : i)
        }));
    };

    const handleRemoveItem = (batchId: string) => {
        setItem(prev => ({...prev, items: prev.items.filter(i => i.batchId !== batchId)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (item.items.length === 0) {
            alert('Please add at least one item to return.');
            return;
        }
        onSave({
            ...item,
            totalAmount,
            id: returnToEdit?.id || Date.now().toString(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{returnToEdit ? 'Edit Sales Return' : 'Create New Return Invoice'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Return #</label>
                            <input type="text" value={item.returnInvoiceNumber} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Return Date</label>
                            <input type="date" name="date" value={item.date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Original Bill #</label>
                            <input type="text" name="originalBillNumber" value={item.originalBillNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                            <input type="text" name="customerName" value={item.customerName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Reason for Return</label>
                        <textarea name="reason" value={item.reason} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Returned Items</h3>
                        <div className="relative">
                            <input type="text" placeholder="Search for products to return..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                            {searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                    {searchResults.map(p => <li key={p.id} onClick={() => handleAddItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer">{p.name}</li>)}
                                </ul>
                            )}
                        </div>
                        <div className="mt-2 max-h-48 overflow-y-auto">
                            {item.items.map(i => (
                                <div key={i.batchId} className="flex items-center justify-between p-2 border-b gap-4">
                                    <div>
                                        <p className="font-semibold">{i.productName}</p>
                                        <p className="text-xs text-gray-500">Batch: {i.batchNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={i.quantity} onChange={e => handleQuantityChange(i.batchId, parseInt(e.target.value))} className="w-16 p-1 border rounded-md text-center"/>
                                        <span className="w-20 text-right">₹{i.total.toFixed(2)}</span>
                                        <button type="button" onClick={() => handleRemoveItem(i.batchId)} className="text-red-500 hover:text-red-700">&times;</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div className="flex justify-end font-bold text-lg mt-2 pr-8">
                            <span>Total: ₹{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                
                    <div className="mt-8 flex justify-end sticky bottom-0 bg-white py-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg mr-4 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700">Save Return</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalesReturnModal;