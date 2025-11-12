import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Purchase } from '../types';
import PurchaseModal from '../components/PurchaseModal';

const initialPurchases: Purchase[] = [
    { id: '1', invoiceNumber: 'INV-00123', supplier: 'PharmaDistributors Ltd.', date: '2023-10-25', totalAmount: 15250.75 },
    { id: '2', invoiceNumber: 'INV-00124', supplier: 'MedSupplies Inc.', date: '2023-10-24', totalAmount: 8400.00 },
    { id: '3', invoiceNumber: 'INV-00125', supplier: 'Wellness Pharma', date: '2023-10-24', totalAmount: 22500.50 },
];

const PurchasesPage: React.FC = () => {
    const [purchases, setPurchases] = useLocalStorage<Purchase[]>('purchases', initialPurchases);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchaseToEdit, setPurchaseToEdit] = useState<Purchase | null>(null);

    const handleSavePurchase = (purchase: Purchase) => {
        if (purchaseToEdit) {
            setPurchases(purchases.map(p => p.id === purchase.id ? purchase : p));
        } else {
            setPurchases([...purchases, { ...purchase, id: Date.now().toString() }]);
        }
        setIsModalOpen(false);
        setPurchaseToEdit(null);
    };

    const handleAddNew = () => {
        setPurchaseToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (purchase: Purchase) => {
        setPurchaseToEdit(purchase);
        setIsModalOpen(true);
    };
    
    const handleDelete = (purchaseId: string) => {
        if (window.confirm('Are you sure you want to delete this purchase invoice?')) {
            setPurchases(purchases.filter(p => p.id !== purchaseId));
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Purchase Invoices</h1>
                <div className="flex gap-2">
                    <button onClick={() => alert('Import functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Import</button>
                    <button onClick={() => alert('Export functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Export</button>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700"
                    >
                        Add New Purchase
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map(purchase => (
                                <tr key={purchase.id}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900 font-semibold">{purchase.invoiceNumber}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900">{purchase.supplier}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900">{purchase.date}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900 font-semibold">₹{purchase.totalAmount.toFixed(2)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                        <button onClick={() => handleEdit(purchase)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">Edit</button>
                                        <button onClick={() => handleDelete(purchase.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <PurchaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePurchase}
                purchaseToEdit={purchaseToEdit}
            />
        </div>
    );
};

export default PurchasesPage;
