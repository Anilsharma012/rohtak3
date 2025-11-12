import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardPage from './DashboardPage';
import ProductsPage from './ProductsPage';
import ImageEditorPage from './ImageEditorPage';
import SalesPage from './SalesPage';
import PurchasesPage from './PurchasesPage';
import BatchesPage from './BatchesPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import StockMovementPage from './StockMovementPage';
import CompliancePage from './CompliancePage';
import ComingSoonPage from './ComingSoonPage';
import PosPage from './PosPage';
import SalesReturnsPage from './SalesReturnsPage';
import PurchaseReturnsPage from './PurchaseReturnsPage';
import SalesOrdersPage from './SalesOrdersPage';
import DeliveryManagementPage from './DeliveryManagementPage';
import UserRolesPage from './UserRolesPage';

interface DashboardLayoutProps {
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'products':
        return <ProductsPage />;
      case 'batches':
        return <BatchesPage />;
      case 'add-stock':
        return <ComingSoonPage title="Add Stock / GRN" />;
      case 'stock-movement':
        return <StockMovementPage />;
      case 'purchase-invoices':
        return <PurchasesPage />;
      case 'purchase-returns':
        return <PurchaseReturnsPage />;
      case 'pos':
        return <PosPage setActivePage={setActivePage} />;
      case 'sales-bills':
        return <SalesPage />;
      case 'sales-returns':
        return <SalesReturnsPage />;
      case 'sales-orders':
        return <SalesOrdersPage />;
      case 'delivery-management':
        return <DeliveryManagementPage />;
      case 'reports':
        return <ReportsPage />;
      case 'compliance':
        return <CompliancePage />;
      case 'image-editor':
        return <ImageEditorPage />;
      case 'user-roles':
        return <UserRolesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ComingSoonPage title={activePage} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;