import React, { useState } from 'react';
import DashboardIcon from './icons/DashboardIcon';
import ProductsIcon from './icons/ProductsIcon';
import ImageEditorIcon from './icons/ImageEditorIcon';
import SalesIcon from './icons/SalesIcon';
import PurchasesIcon from './icons/PurchasesIcon';
import InventoryIcon from './icons/InventoryIcon';
import ReportsIcon from './icons/ReportsIcon';
import SettingsIcon from './icons/SettingsIcon';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
}

const navItems = [
    { type: 'link', id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
    { 
        type: 'header', 
        label: 'INVENTORY',
        id: 'inventory',
        children: [
            { type: 'link', id: 'products', label: 'All Products', icon: <ProductsIcon className="w-5 h-5" /> },
            { type: 'link', id: 'batches', label: 'Batches & Stock', icon: <InventoryIcon className="w-5 h-5" /> },
            { type: 'link', id: 'add-stock', label: 'Add Stock / GRN', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg> },
            { type: 'link', id: 'stock-movement', label: 'Stock Movement', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16M4 8h16M4 12h16M4 16h16" /></svg> },
        ]
    },
    { 
        type: 'header', 
        label: 'PURCHASES',
        id: 'purchases',
        children: [
            { type: 'link', id: 'purchase-invoices', label: 'Purchase Invoices', icon: <PurchasesIcon className="w-5 h-5" /> },
            { type: 'link', id: 'purchase-returns', label: 'Purchase Returns', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 9v3a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h3" /></svg> },
        ]
    },
    { 
        type: 'header', 
        label: 'SALES & POS',
        id: 'sales',
        children: [
            { type: 'link', id: 'pos', label: 'New Bill (POS)', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> },
            { type: 'link', id: 'sales-bills', label: 'All Bills', icon: <SalesIcon className="w-5 h-5" /> },
            { type: 'link', id: 'sales-returns', label: 'Sales Returns', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" /></svg> },
            { type: 'link', id: 'sales-orders', label: 'Sales Orders', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
            { type: 'link', id: 'delivery-management', label: 'Delivery Options', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 16h2a2 2 0 002-2V7a2 2 0 00-2-2h-3.382a1 1 0 00-.894.553L12 8" /></svg> },
        ]
    },
    { type: 'header', label: 'REPORTS & COMPLIANCE' },
    { type: 'link', id: 'reports', label: 'Reports', icon: <ReportsIcon className="w-5 h-5" /> },
    { type: 'link', id: 'compliance', label: 'Compliance', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { type: 'header', label: 'TOOLS' },
    { type: 'link', id: 'image-editor', label: 'AI Image Editor', icon: <ImageEditorIcon className="w-5 h-5" /> },
    { type: 'header', label: 'ADMINISTRATION' },
    { type: 'link', id: 'user-roles', label: 'User Roles & Permissions', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.965 5.965 0 0112 13a5.965 5.965 0 013 1.803" /></svg> },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onLogout }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    inventory: true,
    purchases: true,
    sales: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const NavLink: React.FC<{ id: string; label: string; icon: React.ReactNode; isSublink?: boolean }> = ({ id, label, icon, isSublink = false }) => (
    <li>
      <button
        onClick={() => setActivePage(id)}
        className={`flex items-center w-full p-2.5 text-sm font-medium rounded-lg transition duration-75 group ${
          activePage === id
            ? 'bg-blue-600 text-white shadow-md'
            : `text-gray-700 hover:bg-gray-100 ${isSublink ? 'pl-8' : ''}`
        }`}
      >
        <span className={`w-5 h-5 ${activePage === id ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`}>{icon}</span>
        <span className="ml-3 text-left">{label}</span>
      </button>
    </li>
  );

  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="flex flex-col h-screen px-3 py-4 bg-white shadow-lg">
        <div className="flex items-center pl-2.5 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="self-center text-xl font-bold whitespace-nowrap ml-2 text-gray-800">Rohtak <span className="text-blue-600">Pharmacy</span></span>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
            <ul className="space-y-1">
                {navItems.map((item, index) => {
                    if (item.type === 'link') {
                        // FIX: Pass props explicitly to avoid type errors with spread operator on union types.
                        return <NavLink key={item.id} id={item.id} label={item.label} icon={item.icon} />
                    } else if (item.type === 'header' && 'children' in item && item.id) {
                        const isOpen = openSections[item.id] || false;
                        return (
                            <li key={item.id}>
                                <button onClick={() => toggleSection(item.id!)} className="flex items-center justify-between w-full p-2.5 text-xs font-bold text-gray-500 uppercase hover:bg-gray-50 rounded-lg">
                                    <span>{item.label}</span>
                                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {isOpen && (
                                    <ul className="pl-2 space-y-1 mt-1">
                                        {/* FIX: Pass props explicitly to avoid type errors with spread operator. */}
                                        {item.children.map(child => <NavLink key={child.id} id={child.id} label={child.label} icon={child.icon} isSublink />)}
                                    </ul>
                                )}
                            </li>
                        );
                    }
                    return <li key={index} className="px-2.5 pt-4 pb-1 text-xs font-bold text-gray-500 uppercase">{item.label}</li>
                })}
            </ul>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
            <ul className="space-y-2">
                <NavLink id="settings" label="Settings" icon={<SettingsIcon className="w-5 h-5" />} />
                 <li>
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full p-2.5 text-sm font-normal text-gray-700 rounded-lg hover:bg-gray-100 group"
                    >
                        <span className="w-5 h-5 text-gray-500 group-hover:text-gray-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </span>
                        <span className="ml-3">Logout</span>
                    </button>
                </li>
            </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;