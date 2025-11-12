import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { SalesOrder, Product, Batch } from '../types';
import SalesOrderModal from '../components/SalesOrderModal';

const initialSalesOrders: SalesOrder[] = [
    { id: '1', orderNumber: 'SO-001', customerName: 'Local Clinic', date: '2023-10-26', totalAmount: 1220.00, items: [], status: 'Pending' },
    { id: '2', orderNumber: 'SO-002', customerName: 'Mr. Gupta', date: '2023-10-25', totalAmount: 450.00, items: [], status: 'Fulfilled' },
    { id: '3', orderNumber: 'SO-003', customerName: 'Online Order', date: '2023-10-24', totalAmount: 800.50, items: [], status: 'Canceled' },
];

const SalesOrdersPage: React.FC = () => {
    const [orders, setOrders] = useLocalStorage<SalesOrder[]>('salesOrders', initialSalesOrders);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState<SalesOrder | null>(null);
    const [products] = useLocalStorage<Product[]>('products', []);
    const [batches] = useLocalStorage<Batch[]>('batches', []);

    const handleSaveOrder = (order: SalesOrder) => {
        if (orderToEdit) {
            setOrders(orders.map(o => o.id === order.id ? order : o));
        } else {
            const newOrderNumber = `SO-${(orders.length + 1).toString().padStart(3, '0')}`;
            setOrders([{ ...order, id: Date.now().toString(), orderNumber: newOrderNumber }, ...orders]);
        }
        setIsModalOpen(false);
        setOrderToEdit(null);
    };

    const handleAddNew = () => {
        setOrderToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (order: SalesOrder) => {
        setOrderToEdit(order);
        setIsModalOpen(true);
    };
    
    const handleDelete = (orderId: string) => {
        if (window.confirm('Are you sure you want to delete this sales order?')) {
            setOrders(orders.filter(o => o.id !== orderId));
        }
    }

    const getStatusClass = (status: 'Pending' | 'Fulfilled' | 'Canceled') => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Fulfilled': return 'bg-green-100 text-green-800';
            case 'Canceled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Sales Orders</h1>
                <button
                    onClick={handleAddNew}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700"
                >
                    Create New Order
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order #</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{order.orderNumber}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{order.customerName}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{order.date}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <span className={`px-2 py-1 font-semibold text-xs rounded-full ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                        <button onClick={() => handleEdit(order)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">View/Edit</button>
                                        <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SalesOrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOrder}
                orderToEdit={orderToEdit}
                products={products}
                batches={batches}
            />
        </div>
    );
};

export default SalesOrdersPage;