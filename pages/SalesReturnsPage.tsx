import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { SalesReturn, Batch, Product } from '../types';
import SalesReturnModal from '../components/SalesReturnModal';

const initialReturns: SalesReturn[] = [
    { id: '1', returnInvoiceNumber: 'RTN-20231026-001', originalBillNumber: 'B-20231025-030', customerName: 'Amit Singh', date: '2023-10-26', totalAmount: 85.00, reason: 'Wrong item purchased', items: [] },
    { id: '2', returnInvoiceNumber: 'RTN-20231025-001', originalBillNumber: 'B-20231022-015', customerName: 'Priya Mehta', date: '2023-10-25', totalAmount: 150.25, reason: 'Product damaged', items: [] },
];

const SalesReturnsPage: React.FC = () => {
    const [returns, setReturns] = useLocalStorage<SalesReturn[]>('salesReturns', initialReturns);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [returnToEdit, setReturnToEdit] = useState<SalesReturn | null>(null);
    const [products] = useLocalStorage<Product[]>('products', []);
    const [batches, setBatches] = useLocalStorage<Batch[]>('batches', []);

    const handleSaveReturn = (item: SalesReturn) => {
        // Update stock based on returned items
        const newBatches = [...batches];
        item.items.forEach(returnedItem => {
            const batchIndex = newBatches.findIndex(b => b.id === returnedItem.batchId);
            if (batchIndex > -1) {
                newBatches[batchIndex].quantity += returnedItem.quantity;
            }
        });
        setBatches(newBatches);

        if (returnToEdit) {
            setReturns(returns.map(r => r.id === item.id ? item : r));
        } else {
            setReturns([{ ...item, id: Date.now().toString() }, ...returns]);
        }
        setIsModalOpen(false);
        setReturnToEdit(null);
    };

    const handleAddNew = () => {
        setReturnToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: SalesReturn) => {
        setReturnToEdit(item);
        setIsModalOpen(true);
    };
    
    const handleDelete = (returnId: string) => {
        if (window.confirm('Are you sure you want to delete this sales return invoice? This action cannot be undone and will not adjust stock levels.')) {
            setReturns(returns.filter(r => r.id !== returnId));
        }
    }

     const handleShare = (item: SalesReturn) => {
        const message = `Rohtak Pharmacy: Sales Return Confirmation\n\nReturn ID: ${item.returnInvoiceNumber}\nDate: ${item.date}\nAmount: ₹${item.totalAmount.toFixed(2)}\n\nCredit note has been issued.`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Sales Returns</h1>
                <div className="flex gap-2">
                    <button onClick={() => alert('Import functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Import</button>
                    <button onClick={() => alert('Export functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Export</button>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700"
                    >
                        Add New Return
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Return #</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.map(item => (
                                <tr key={item.id}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-semibold">{item.returnInvoiceNumber}</p>
                                        <p className="text-gray-600 whitespace-no-wrap text-xs">Ref Bill: {item.originalBillNumber}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900">{item.customerName}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900">{item.date}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900 font-semibold">₹{item.totalAmount.toFixed(2)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium p-1">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 mr-3 font-medium p-1">Delete</button>
                                        <button onClick={() => handleShare(item)} className="text-green-600 hover:text-green-900 font-medium p-1 inline-flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            Share
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SalesReturnModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveReturn}
                returnToEdit={returnToEdit}
                products={products}
                batches={batches}
            />
        </div>
    );
};

export default SalesReturnsPage;