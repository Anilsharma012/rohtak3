import React, { useState, useEffect, useMemo } from 'react';
import type { SalesOrder, BillItem, Product, Batch } from '../types';

interface SalesOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: SalesOrder) => void;
    orderToEdit: SalesOrder | null;
    products: Product[];
    batches: Batch[];
}

const emptyOrder: Omit<SalesOrder, 'id' | 'orderNumber'> = {
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    items: [],
    status: 'Pending',
};

const SalesOrderModal: React.FC<SalesOrderModalProps> = ({ isOpen, onClose, onSave, orderToEdit, products, batches }) => {
    const [order, setOrder] = useState<Omit<SalesOrder, 'id' | 'orderNumber'>>({ ...emptyOrder });
    const [searchTerm, setSearchTerm] = useState('');

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, products]);
    
    const totalAmount = useMemo(() => order.items.reduce((sum, i) => sum + i.total, 0), [order.items]);

    useEffect(() => {
        if (orderToEdit) {
            setOrder(orderToEdit);
        } else {
            setOrder({ ...emptyOrder });
        }
    }, [orderToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOrder(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddItem = (product: Product) => {
        const batch = batches.find(b => b.productId === product.id); // Find any batch for MRP info
        const newItem: BillItem = {
            productId: product.id, productName: product.name, batchId: batch?.id || 'N/A',
            batchNumber: batch?.batchNumber || 'N/A', quantity: 1, mrp: batch?.mrp || product.mrp, total: batch?.mrp || product.mrp
        };
        setOrder(prev => ({...prev, items: [...prev.items, newItem]}));
        setSearchTerm('');
    };
    
    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setOrder(prev => ({
            ...prev,
            items: prev.items.map(i => i.productId === productId ? {...i, quantity: newQuantity, total: newQuantity * i.mrp} : i)
        }));
    };

    const handleRemoveItem = (productId: string) => {
        setOrder(prev => ({...prev, items: prev.items.filter(i => i.productId !== productId)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (order.items.length === 0) {
            alert('Please add at least one item to the order.');
            return;
        }
        onSave({
            ...order,
            totalAmount,
            id: orderToEdit?.id || Date.now().toString(),
            orderNumber: orderToEdit?.orderNumber || ''
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{orderToEdit ? `Edit Order #${orderToEdit.orderNumber}` : 'Create New Sales Order'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                            <input type="text" name="customerName" value={order.customerName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Order Date</label>
                            <input type="date" name="date" value={order.date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={order.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3">
                                <option>Pending</option>
                                <option>Fulfilled</option>
                                <option>Canceled</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Order Items</h3>
                        <div className="relative">
                            <input type="text" placeholder="Search for products to add..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                            {searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                    {searchResults.map(p => <li key={p.id} onClick={() => handleAddItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer">{p.name}</li>)}
                                </ul>
                            )}
                        </div>
                        <div className="mt-2 max-h-64 overflow-y-auto">
                            {order.items.map(i => (
                                <div key={i.productId} className="flex items-center justify-between p-2 border-b gap-4">
                                    <p className="font-semibold flex-1">{i.productName}</p>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={i.quantity} onChange={e => handleQuantityChange(i.productId, parseInt(e.target.value))} className="w-16 p-1 border rounded-md text-center"/>
                                        <span className="w-20 text-right">₹{i.total.toFixed(2)}</span>
                                        <button type="button" onClick={() => handleRemoveItem(i.productId)} className="text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
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
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700">Save Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalesOrderModal;
