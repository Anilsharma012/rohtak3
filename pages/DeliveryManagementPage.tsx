import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { DeliveryOption } from '../types';
import DeliveryOptionModal from '../components/DeliveryOptionModal';

const initialDeliveryOptions: DeliveryOption[] = [
    { id: '1', name: 'Standard Home Delivery (3-5 days)', fee: 50.00, status: 'Enabled' },
    { id: '2', name: 'Express Home Delivery (24 hours)', fee: 100.00, status: 'Enabled' },
    { id: '3', name: 'In-Store Pickup', fee: 0.00, status: 'Disabled' },
];

const DeliveryManagementPage: React.FC = () => {
    const [options, setOptions] = useLocalStorage<DeliveryOption[]>('deliveryOptions', initialDeliveryOptions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [optionToEdit, setOptionToEdit] = useState<DeliveryOption | null>(null);

    const handleSaveOption = (option: DeliveryOption) => {
        if (optionToEdit) {
            setOptions(options.map(o => o.id === option.id ? option : o));
        } else {
            setOptions([...options, { ...option, id: Date.now().toString() }]);
        }
        setIsModalOpen(false);
        setOptionToEdit(null);
    };

    const handleAddNew = () => {
        setOptionToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (option: DeliveryOption) => {
        setOptionToEdit(option);
        setIsModalOpen(true);
    };
    
    const handleDelete = (optionId: string) => {
        if (window.confirm('Are you sure you want to delete this delivery option?')) {
            setOptions(options.filter(o => o.id !== optionId));
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Delivery Options Management</h1>
                <button
                    onClick={handleAddNew}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700"
                >
                    Add New Option
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Option Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {options.map(option => (
                                <tr key={option.id}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{option.name}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">₹{option.fee.toFixed(2)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${option.status === 'Enabled' ? 'text-green-900' : 'text-gray-700'}`}>
                                            <span aria-hidden className={`absolute inset-0 ${option.status === 'Enabled' ? 'bg-green-200' : 'bg-gray-200'} opacity-50 rounded-full`}></span>
                                            <span className="relative">{option.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                        <button onClick={() => handleEdit(option)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">Edit</button>
                                        <button onClick={() => handleDelete(option.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeliveryOptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOption}
                optionToEdit={optionToEdit}
            />
        </div>
    );
};

export default DeliveryManagementPage;