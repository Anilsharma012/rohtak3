import React, { useState, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Product, Batch, Sale, BillItem } from '../types';

const PosPage: React.FC<{ setActivePage: (page: string) => void }> = ({ setActivePage }) => {
    const [products] = useLocalStorage<Product[]>('products', []);
    const [batches, setBatches] = useLocalStorage<Batch[]>('batches', []);
    const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [customerName, setCustomerName] = useState('Walk-in Customer');
    const [billItems, setBillItems] = useState<BillItem[]>([]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, products]);

    const handleAddItem = useCallback((product: Product) => {
        // FEFO Logic: Find the earliest expiry batch with available stock
        const availableBatches = batches
            .filter(b => b.productId === product.id && b.quantity > 0)
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

        if (availableBatches.length === 0) {
            alert(`No stock available for ${product.name}`);
            return;
        }

        const batchToSell = availableBatches[0];
        
        const existingItemIndex = billItems.findIndex(item => item.batchId === batchToSell.id);

        if (existingItemIndex > -1) {
            // If item from same batch exists, just increase quantity if stock allows
            if (billItems[existingItemIndex].quantity < batchToSell.quantity) {
                 setBillItems(billItems.map((item, index) => 
                    index === existingItemIndex ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.mrp } : item
                ));
            } else {
                alert(`No more stock available for ${product.name} in batch ${batchToSell.batchNumber}`);
            }
        } else {
             // Add new item to the bill
            const newItem: BillItem = {
                productId: product.id,
                productName: product.name,
                batchId: batchToSell.id,
                batchNumber: batchToSell.batchNumber,
                quantity: 1,
                mrp: batchToSell.mrp,
                total: batchToSell.mrp,
            };
            setBillItems([...billItems, newItem]);
        }
        setSearchTerm('');
    }, [batches, billItems]);

    const handleQuantityChange = (batchId: string, newQuantity: number) => {
        const batch = batches.find(b => b.id === batchId);
        if (batch && newQuantity > 0 && newQuantity <= batch.quantity) {
             setBillItems(billItems.map(item => 
                item.batchId === batchId ? { ...item, quantity: newQuantity, total: newQuantity * item.mrp } : item
            ));
        } else if (batch && newQuantity > batch.quantity) {
            alert(`Only ${batch.quantity} units available in stock for this batch.`);
        }
    };
    
    const handleRemoveItem = (batchId: string) => {
        setBillItems(billItems.filter(item => item.batchId !== batchId));
    };

    const totalAmount = useMemo(() => billItems.reduce((sum, item) => sum + item.total, 0), [billItems]);

    const handleSaveBill = (share: boolean = false) => {
        if (billItems.length === 0) {
            alert('Cannot save an empty bill.');
            return;
        }

        const newBillNumber = `B-${new Date().toISOString().split('T')[0]}-${(sales.length + 1).toString().padStart(3, '0')}`;
        
        const newSale: Sale = {
            id: Date.now().toString(),
            billNumber: newBillNumber,
            customerName,
            date: new Date().toISOString().split('T')[0],
            totalAmount,
            items: billItems,
        };

        // Update stock
        const newBatches = [...batches];
        billItems.forEach(item => {
            const batchIndex = newBatches.findIndex(b => b.id === item.batchId);
            if (batchIndex > -1) {
                newBatches[batchIndex].quantity -= item.quantity;
            }
        });

        setBatches(newBatches);
        setSales([newSale, ...sales]);

        alert(`Bill ${newBillNumber} saved successfully!`);

        if (share) {
            const message = `Thank you for your purchase from Rohtak Pharmacy!\n\nBill No: ${newSale.billNumber}\nDate: ${newSale.date}\nAmount: ₹${newSale.totalAmount.toFixed(2)}\n\nVisit again!`;
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }

        // Reset for next bill
        setBillItems([]);
        setCustomerName('Walk-in Customer');
        setActivePage('sales-bills'); // Navigate to all bills page
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Side - Search and Bill Items */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md flex flex-col">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Create New Bill</h1>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search for products to add to the bill..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                            {searchResults.map(product => (
                                <li key={product.id} onClick={() => handleAddItem(product)} className="p-3 hover:bg-gray-100 cursor-pointer">
                                    {product.name} <span className="text-gray-500 text-sm">({product.brand})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    {billItems.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                           <p>No items added to the bill yet.</p>
                        </div>
                    ) : (
                        <table className="min-w-full">
                             <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-semibold text-gray-600">Product</th>
                                    <th className="text-center py-2 font-semibold text-gray-600">Qty</th>
                                    <th className="text-right py-2 font-semibold text-gray-600">MRP</th>
                                    <th className="text-right py-2 font-semibold text-gray-600">Total</th>
                                    <th className="text-center py-2 font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billItems.map(item => (
                                    <tr key={item.batchId} className="border-b">
                                        <td className="py-3">
                                            <p className="font-semibold text-gray-800">{item.productName}</p>
                                            <p className="text-xs text-gray-500">Batch: {item.batchNumber}</p>
                                        </td>
                                        <td className="py-3 w-24 text-center">
                                            <input 
                                                type="number" 
                                                value={item.quantity} 
                                                onChange={e => handleQuantityChange(item.batchId, parseInt(e.target.value))}
                                                className="w-16 p-1 border rounded-md text-center"
                                            />
                                        </td>
                                        <td className="py-3 text-right">₹{item.mrp.toFixed(2)}</td>
                                        <td className="py-3 text-right font-semibold">₹{item.total.toFixed(2)}</td>
                                        <td className="py-3 text-center">
                                            <button onClick={() => handleRemoveItem(item.batchId)} className="text-red-500 hover:text-red-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Right Side - Bill Summary and Actions */}
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Bill Summary</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-gray-600">
                        <span>Discount</span>
                        <span>- ₹0.00</span>
                    </div>
                </div>
                <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-800 mb-4">
                        <span>Grand Total</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="space-y-3">
                        <button 
                            onClick={() => handleSaveBill(false)}
                            disabled={billItems.length === 0}
                            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Save Bill
                        </button>
                         <button 
                            onClick={() => handleSaveBill(true)}
                            disabled={billItems.length === 0}
                            className="w-full py-3 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Save & Share on WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PosPage;
