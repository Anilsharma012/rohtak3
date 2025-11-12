import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { StockMovement } from '../types';

const initialMovements: StockMovement[] = [
    { id: '1', date: '2023-10-26 10:00:00', productId: '1', productName: 'Calpol 500mg', batchNumber: 'CPL1001', type: 'IN', quantity: 100, reason: 'GRN-0567', user: 'admin' },
    { id: '2', date: '2023-10-26 14:30:00', productId: '2', productName: 'Cetzine 10mg', batchNumber: 'CTZ201A', type: 'OUT', quantity: 5, reason: 'Bill-20231026-001', user: 'admin' },
    { id: '3', date: '2023-10-25 18:00:00', productId: '1', productName: 'Calpol 500mg', batchNumber: 'CPL1001', type: 'OUT', quantity: 2, reason: 'Bill-20231025-045', user: 'admin' },
    { id: '4', date: '2023-10-24 11:00:00', productId: '4', productName: 'Vicks Vaporub', batchNumber: 'VKS088B', type: 'ADJUSTMENT', quantity: -1, reason: 'Damaged', user: 'admin' },
];

const StockMovementPage: React.FC = () => {
    const [movements] = useLocalStorage<StockMovement[]>('stockMovements', initialMovements);
    
    const getTypeClass = (type: string) => {
        switch (type) {
            case 'IN': return 'bg-green-100 text-green-800';
            case 'OUT': return 'bg-red-100 text-red-800';
            case 'ADJUSTMENT': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Stock Movement Ledger</h1>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason / Ref</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map(move => (
                                <tr key={move.id}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900 whitespace-no-wrap">{move.date}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-semibold">{move.productName}</p>
                                        <p className="text-gray-600 whitespace-no-wrap text-xs">Batch: {move.batchNumber}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                         <span className={`px-2 py-1 font-semibold text-xs rounded-full ${getTypeClass(move.type)}`}>
                                            {move.type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold text-gray-900 whitespace-no-wrap">{move.quantity}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900 whitespace-no-wrap">{move.reason}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-900 whitespace-no-wrap">{move.user}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockMovementPage;
