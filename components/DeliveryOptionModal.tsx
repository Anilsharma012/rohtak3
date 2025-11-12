import React, { useState, useEffect } from 'react';
import type { DeliveryOption } from '../types';

interface DeliveryOptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (option: DeliveryOption) => void;
    optionToEdit: DeliveryOption | null;
}

const emptyOption: Omit<DeliveryOption, 'id'> = {
    name: '',
    fee: 0,
    status: 'Enabled',
};

const DeliveryOptionModal: React.FC<DeliveryOptionModalProps> = ({ isOpen, onClose, onSave, optionToEdit }) => {
    const [option, setOption] = useState<Omit<DeliveryOption, 'id'>>({ ...emptyOption });

    useEffect(() => {
        if (optionToEdit) {
            setOption(optionToEdit);
        } else {
            setOption({ ...emptyOption });
        }
    }, [optionToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOption(prev => ({ ...prev, [name]: name === 'fee' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...option,
            id: optionToEdit?.id || Date.now().toString(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{optionToEdit ? 'Edit Delivery Option' : 'Add New Delivery Option'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Option Name</label>
                            <input type="text" name="name" value={option.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fee (₹)</label>
                                <input type="number" step="0.01" name="fee" value={option.fee} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={option.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="Enabled">Enabled</option>
                                    <option value="Disabled">Disabled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg mr-4 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700">Save Option</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryOptionModal;
