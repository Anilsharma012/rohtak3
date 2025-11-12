import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { PurchaseReturn } from '../types';
import PurchaseReturnModal from '../components/PurchaseReturnModal';

const initialPurchaseReturns: PurchaseReturn[] = [
    { id: '1', returnInvoiceNumber: 'PR-20231026-001', originalPurchaseInvoice: 'INV-00123', supplier: 'PharmaDistributors Ltd.', date: '2023-10-26', totalAmount: 500.00, reason: 'Damaged stock' },
    { id: '2', returnInvoiceNumber: 'PR-20231025-001', originalPurchaseInvoice: 'INV-00120', supplier: 'MedSupplies Inc.', date: '2023-10-25', totalAmount: 1250.75, reason: 'Near expiry' },
];

const PurchaseReturnsPage: React.FC = () => {
    const [returns, setReturns] = useLocalStorage<PurchaseReturn[]>('purchaseReturns', initialPurchaseReturns);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [returnToEdit, setReturnToEdit] = useState<PurchaseReturn | null>(null);

    const handleSaveReturn = (item: PurchaseReturn) => {
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

    const handleEdit = (item: PurchaseReturn) => {
        setReturnToEdit(item);
        setIsModalOpen(true);
    };
    
    const handleDelete = (returnId: string) => {
        if (window.confirm('Are you sure you want to delete this purchase return?')) {
            setReturns(returns.filter(r => r.id !== returnId));
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Purchase Returns</h1>
                <button
                    onClick={handleAddNew}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-orange-600"
                >
                    Create Purchase Return
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Return #</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
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
                                        <p className="text-gray-600 whitespace-no-wrap text-xs">Ref Inv: {item.originalPurchaseInvoice}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900">{item.supplier}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900">{item.date}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900 font-semibold">₹{item.totalAmount.toFixed(2)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium p-1">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 font-medium p-1">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <PurchaseReturnModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveReturn}
                returnToEdit={returnToEdit}
            />
        </div>
    );
};

export default PurchaseReturnsPage;