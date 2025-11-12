import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

interface Settings {
    pharmacyName: string;
    gstNumber: string;
    drugLicense: string;
    contactEmail: string;
    address: string;
    dispensingMethod: 'FEFO' | 'FIFO';
    expiryThreshold: number;
    negativeStock: 'Enabled' | 'Disabled';
    defaultCustomer: string;
    mandatoryRx: 'Enabled' | 'Disabled';
    defaultGst: number;
}

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useLocalStorage<Settings>('appSettings', {
        pharmacyName: 'Rohtak Pharmacy',
        gstNumber: '06ABCDE1234F1Z5',
        drugLicense: 'HR-12345-XYZ',
        contactEmail: 'contact@rohtakpharmacy.com',
        address: '123, Medical More, Rohtak, Haryana, 124001',
        dispensingMethod: 'FEFO',
        expiryThreshold: 90,
        negativeStock: 'Enabled',
        defaultCustomer: 'Walk-in Customer',
        mandatoryRx: 'Enabled',
        defaultGst: 12,
    });
    const [tempSettings, setTempSettings] = useState(settings);
    const [saved, setSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTempSettings(prev => ({ ...prev, [name]: name === 'expiryThreshold' || name === 'defaultGst' ? Number(value) : value }));
    };
    
    const handleSave = () => {
        setSettings(tempSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000); // Hide message after 2 seconds
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <div className="flex items-center">
                    {saved && <span className="text-green-600 mr-4 font-semibold">Settings saved!</span>}
                    <button onClick={handleSave} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700">
                        Save Changes
                    </button>
                </div>
            </div>

            <SettingsSection title="Organization Information">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pharmacy Name</label>
                        <input type="text" name="pharmacyName" value={tempSettings.pharmacyName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">GST Number</label>
                        <input type="text" name="gstNumber" value={tempSettings.gstNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Drug License No.</label>
                        <input type="text" name="drugLicense" value={tempSettings.drugLicense} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                        <input type="email" name="contactEmail" value={tempSettings.contactEmail} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" name="address" value={tempSettings.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title="Inventory Rules">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Default Dispensing Method</label>
                        <select name="dispensingMethod" value={tempSettings.dispensingMethod} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                           <option value="FEFO">First-Expiry-First-Out (FEFO)</option>
                           <option value="FIFO">First-In-First-Out (FIFO)</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Near-Expiry Alert Threshold (Days)</label>
                        <input type="number" name="expiryThreshold" value={tempSettings.expiryThreshold} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Negative Stock Prevention</label>
                         <select name="negativeStock" value={tempSettings.negativeStock} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                           <option value="Enabled">Enabled (Block Sale)</option>
                           <option value="Disabled">Disabled (Allow Sale)</option>
                        </select>
                    </div>
                </div>
            </SettingsSection>
            
             <SettingsSection title="Billing & Tax">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Default Customer</label>
                        <input type="text" name="defaultCustomer" value={tempSettings.defaultCustomer} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mandatory Rx for H1 Drugs</label>
                         <select name="mandatoryRx" value={tempSettings.mandatoryRx} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                           <option value="Enabled">Enabled</option>
                           <option value="Disabled">Disabled</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Default GST Slab (%)</label>
                        <input type="number" name="defaultGst" value={tempSettings.defaultGst} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>
            </SettingsSection>

        </div>
    );
};

export default SettingsPage;