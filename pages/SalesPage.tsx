import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Sale } from '../types';
import SaleModal from '../components/SaleModal';
import { initialProducts } from './ProductsPage'; // for modal
import BillDetailsModal from '../components/BillDetailsModal';

const initialSales: Sale[] = [
    { 
        id: '1', 
        billNumber: 'B-20231026-001', 
        customerName: 'Ramesh Kumar', 
        date: '2023-10-26', 
        totalAmount: 50.50, 
        items: [
            { productId: '1', productName: 'Calpol 500mg', batchId: 'b1', batchNumber: 'CPL1001', quantity: 1, mrp: 30.50, total: 30.50 },
            { productId: '2', productName: 'Cetzine 10mg', batchId: 'b3', batchNumber: 'CTZ201A', quantity: 1, mrp: 20.00, total: 20.00 }
        ] 
    },
    { 
        id: '2', 
        billNumber: 'B-20231026-002', 
        customerName: 'Walk-in Customer', 
        date: '2023-10-26', 
        totalAmount: 120.00, 
        items: [
            { productId: '3', productName: 'Mox 250mg', batchId: 'b-mox-1', batchNumber: 'MOX-A1', quantity: 1, mrp: 85.00, total: 85.00 },
            { productId: '6', productName: 'Crocin Advance', batchId: 'b4', batchNumber: 'CRCADV01', quantity: 1, mrp: 35.00, total: 35.00 }
        ] 
    },
    { 
        id: '3', 
        billNumber: 'B-20231025-045', 
        customerName: 'Sunita Sharma', 
        date: '2023-10-25', 
        totalAmount: 890.75, 
        items: [
            { productId: '3', productName: 'Mox 250mg', batchId: 'b-mox-2', batchNumber: 'MOX-A2', quantity: 10, mrp: 85.00, total: 850.00 },
            { productId: '4', productName: 'Vicks Vaporub', batchId: 'b-vicks-1', batchNumber: 'VKS-B1', quantity: 1, mrp: 40.75, total: 40.75 }
        ]
    },
];

const SalesPage: React.FC = () => {
    const [sales, setSales] = useLocalStorage<Sale[]>('sales', initialSales);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
    const [saleToView, setSaleToView] = useState<Sale | null>(null);

    const handleSaveSale = (sale: Sale) => {
        if (saleToEdit) {
            setSales(sales.map(s => s.id === sale.id ? sale : s));
        } else {
            setSales([{ ...sale, id: Date.now().toString() }, ...sales]);
        }
        setIsEditModalOpen(false);
        setSaleToEdit(null);
    };

    const handleEdit = (sale: Sale) => {
        setSaleToEdit(sale);
        setIsEditModalOpen(true);
    };

    const handleView = (sale: Sale) => {
        setSaleToView(sale);
        setIsViewModalOpen(true);
    };
    
    const handleDelete = (saleId: string) => {
        if (window.confirm('Are you sure you want to delete this sales bill?')) {
            setSales(sales.filter(s => s.id !== saleId));
        }
    }

    const handleShare = (sale: Sale) => {
        const message = `Thank you for your purchase from Rohtak Pharmacy!\n\nBill No: ${sale.billNumber}\nDate: ${sale.date}\nAmount: ₹${sale.totalAmount.toFixed(2)}\n\nVisit again!`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">All Sales Bills</h1>
                 <div className="flex gap-2">
                    <button onClick={() => alert('Import functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Import</button>
                    <button onClick={() => alert('Export functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Export</button>
                    {/* The "Create New Bill" button is now primarily on the POS page */}
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill #</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr key={sale.id}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900 font-semibold">{sale.billNumber}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900">{sale.customerName}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900">{sale.date}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900 font-semibold">₹{sale.totalAmount.toFixed(2)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center whitespace-nowrap">
                                        <button onClick={() => handleView(sale)} className="text-blue-600 hover:text-blue-900 mr-3 font-medium p-1">View</button>
                                        <button onClick={() => handleEdit(sale)} className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium p-1">Edit</button>
                                        <button onClick={() => handleDelete(sale.id)} className="text-red-600 hover:text-red-900 mr-3 font-medium p-1">Delete</button>
                                        <button onClick={() => handleShare(sale)} className="text-green-600 hover:text-green-900 font-medium p-1 inline-flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            Share
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Note: The modal is kept for editing, but new sales are made via POS */}
            <SaleModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveSale}
                saleToEdit={saleToEdit}
            />
            <BillDetailsModal 
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                sale={saleToView}
            />
        </div>
    );
};

export default SalesPage;