export enum Schedule {
    NONE = 'NONE',
    H = 'H',
    H1 = 'H1',
    X = 'X',
    G = 'G',
}

export type AuthRole = 'admin' | 'pharmacist' | 'inventory_manager' | 'cashier' | 'viewer';
export interface AuthUser { id: string; name: string; email: string; role: AuthRole }

export type Uom = 'Tablet' | 'Strip' | 'Box' | 'Bottle';

export interface Product {
    id: string;
    name: string;
    brand: string;
    composition: string;
    hsn: string;
    schedule: Schedule;
    packSize: number;
    uom: Uom;
    mrp: number;
    ptr: number;
    pts: number;
    rackLocation: string;
    reorderLevel: number;
    stock: number;
}

export interface Batch {
    id: string;
    productId: string;
    productName?: string;
    batchNumber: string;
    expiryDate: string; // YYYY-MM-DD
    purchasePrice: number;
    mrp: number;
    quantity: number;
}

export interface Purchase {
    id: string;
    invoiceNumber: string;
    supplier: string;
    date: string; // YYYY-MM-DD
    totalAmount: number;
}

export interface PurchaseReturn {
    id: string;
    returnInvoiceNumber: string;
    originalPurchaseInvoice: string;
    supplier: string;
    date: string; // YYYY-MM-DD
    totalAmount: number;
    reason: string;
}

export interface BillItem {
    productId: string;
    productName: string;
    batchId: string;
    batchNumber: string;
    quantity: number;
    mrp: number;
    total: number;
}

export interface Sale {
    id: string;
    billNumber: string;
    customerName: string;
    date: string; // YYYY-MM-DD
    totalAmount: number;
    items: BillItem[];
}

export interface SalesReturn {
    id: string;
    returnInvoiceNumber: string;
    originalBillNumber: string;
    customerName: string;
    date: string; // YYYY-MM-DD
    totalAmount: number;
    reason: string;
    items: BillItem[];
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';

export interface StockMovement {
    id: string;
    date: string; // YYYY-MM-DD HH:mm:ss
    productId: string;
    productName: string;
    batchNumber: string;
    type: MovementType;
    quantity: number;
    reason: string;
    user: string;
}

export type UserRole = 'Admin' | 'Pharmacist' | 'Sales';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'Active' | 'Inactive';
}

export interface SalesOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    date: string; // YYYY-MM-DD
    totalAmount: number;
    items: BillItem[];
    status: 'Pending' | 'Fulfilled' | 'Canceled';
}

export interface DeliveryOption {
    id: string;
    name: string;
    fee: number;
    status: 'Enabled' | 'Disabled';
}
