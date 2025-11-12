import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Product, Schedule } from '../types';
import ProductModal from '../components/ProductModal';

// FIX: Export initialProducts to make it available for other modules.
export const initialProducts: Product[] = [
    { id: '1', name: 'Calpol 500mg', brand: 'GSK', composition: 'Paracetamol', hsn: '30049099', schedule: Schedule.NONE, packSize: 15, uom: 'Strip', mrp: 30.50, ptr: 22.00, pts: 25.00, rackLocation: 'A1-03', reorderLevel: 50, stock: 120 },
    { id: '2', name: 'Cetzine 10mg', brand: 'Dr. Reddy', composition: 'Cetirizine', hsn: '30049099', schedule: Schedule.H, packSize: 10, uom: 'Strip', mrp: 20.00, ptr: 15.00, pts: 17.50, rackLocation: 'B2-01', reorderLevel: 30, stock: 95 },
    { id: '3', name: 'Mox 250mg', brand: 'Sun Pharma', composition: 'Amoxicillin', hsn: '30041090', schedule: Schedule.H1, packSize: 10, uom: 'Strip', mrp: 85.00, ptr: 65.00, pts: 72.00, rackLocation: 'A1-05', reorderLevel: 20, stock: 80 },
    { id: '4', name: 'Vicks Vaporub', brand: 'P&G', composition: 'Menthol, Camphor, Eucalyptus Oil', hsn: '30049011', schedule: Schedule.NONE, packSize: 1, uom: 'Bottle', mrp: 45.00, ptr: 35.00, pts: 40.00, rackLocation: 'C3-12', reorderLevel: 10, stock: 5 },
    { id: '5', name: 'Band-Aid Assorted', brand: 'J&J', composition: 'N/A', hsn: '30051090', schedule: Schedule.NONE, packSize: 20, uom: 'Box', mrp: 50.00, ptr: 40.00, pts: 45.00, rackLocation: 'C3-15', reorderLevel: 15, stock: 12 },
    { id: '6', name: 'Crocin Advance', brand: 'GSK', composition: 'Paracetamol', hsn: '30049099', schedule: Schedule.NONE, packSize: 15, uom: 'Strip', mrp: 35.00, ptr: 25.00, pts: 29.00, rackLocation: 'A1-04', reorderLevel: 10, stock: 3 },
];

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [scheduleFilter, setScheduleFilter] = useState('ALL');
    const [stockStatusFilter, setStockStatusFilter] = useState('ALL');

    const handleSaveProduct = (product: Product) => {
        if (productToEdit) {
            setProducts(products.map(p => p.id === product.id ? product : p));
        } else {
            setProducts([...products, { ...product, id: Date.now().toString() }]);
        }
        setIsModalOpen(false);
        setProductToEdit(null);
    };

    const handleAddNew = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };
    
    const handleDelete = (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== productId));
        }
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.composition.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSchedule = scheduleFilter === 'ALL' || p.schedule === scheduleFilter;
        
        const matchesStockStatus = stockStatusFilter === 'ALL' ||
            (stockStatusFilter === 'IN_STOCK' && p.stock > p.reorderLevel) ||
            (stockStatusFilter === 'LOW_STOCK' && p.stock > 0 && p.stock <= p.reorderLevel) ||
            (stockStatusFilter === 'OUT_OF_STOCK' && p.stock === 0);

        return matchesSearch && matchesSchedule && matchesStockStatus;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
                <div className="flex gap-2">
                    <button onClick={() => alert('Import functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Import</button>
                    <button onClick={() => alert('Export functionality coming soon!')} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">Export</button>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700"
                    >
                        Add New Product
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name, brand, or composition..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <div className="flex gap-4 mb-6">
                <div>
                    <label htmlFor="schedule-filter" className="block text-sm font-medium text-gray-700">Schedule</label>
                    <select
                        id="schedule-filter"
                        value={scheduleFilter}
                        onChange={e => setScheduleFilter(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="ALL">All Schedules</option>
                        {Object.values(Schedule).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="stock-filter" className="block text-sm font-medium text-gray-700">Stock Status</label>
                    <select
                        id="stock-filter"
                        value={stockStatusFilter}
                        onChange={e => setStockStatusFilter(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="ALL">All</option>
                        <option value="IN_STOCK">In Stock</option>
                        <option value="LOW_STOCK">Low Stock</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">MRP</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-semibold">{product.name}</p>
                                        <p className="text-gray-600 whitespace-no-wrap text-xs">{product.composition}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{product.brand}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${product.stock <= product.reorderLevel ? 'text-red-900' : 'text-green-900'}`}>
                                            <span aria-hidden className={`absolute inset-0 ${product.stock <= product.reorderLevel ? 'bg-red-200' : 'bg-green-200'} opacity-50 rounded-full`}></span>
                                            <span className="relative">{product.stock} {product.uom}(s)</span>
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">₹{product.mrp.toFixed(2)}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{product.rackLocation}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                        <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">Edit</button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                productToEdit={productToEdit}
            />
        </div>
    );
};

export default ProductsPage;