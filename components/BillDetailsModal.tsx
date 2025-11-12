import React from 'react';
import type { Sale } from '../types';

declare const jspdf: any;

interface BillDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | null;
}

const BillDetailsModal: React.FC<BillDetailsModalProps> = ({ isOpen, onClose, sale }) => {
    if (!isOpen || !sale) return null;

    const generatePdf = () => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("Rohtak Pharmacy", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text("123, Medical More, Rohtak, Haryana", 105, 27, { align: 'center' });
        doc.line(14, 32, 196, 32);

        // Bill Info
        doc.setFontSize(12);
        doc.text(`Bill No: ${sale.billNumber}`, 14, 40);
        doc.text(`Date: ${sale.date}`, 196, 40, { align: 'right' });
        doc.text(`Customer: ${sale.customerName}`, 14, 47);
        doc.line(14, 52, 196, 52);
        
        // Table Header
        doc.setFont("helvetica", "bold");
        doc.text("Item", 14, 60);
        doc.text("Qty", 120, 60);
        doc.text("Rate", 150, 60);
        doc.text("Amount", 196, 60, { align: 'right' });
        doc.setFont("helvetica", "normal");
        
        // Table Body
        let yPos = 68;
        sale.items.forEach(item => {
            doc.text(item.productName, 14, yPos);
            doc.text(item.quantity.toString(), 120, yPos);
            doc.text(`₹${item.mrp.toFixed(2)}`, 150, yPos);
            doc.text(`₹${item.total.toFixed(2)}`, 196, yPos, { align: 'right' });
            yPos += 7;
        });
        
        // Footer
        doc.line(14, yPos + 2, 196, yPos + 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`Grand Total:`, 14, yPos + 10);
        doc.text(`₹${sale.totalAmount.toFixed(2)}`, 196, yPos + 10, { align: 'right' });
        
        doc.setFontSize(10);
        doc.text("Thank you for your visit!", 105, yPos + 30, { align: 'center' });

        doc.save(`Bill-${sale.billNumber}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Bill Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto" id="bill-content">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold">Rohtak Pharmacy</h3>
                        <p className="text-sm text-gray-500">123, Medical More, Rohtak, Haryana</p>
                    </div>
                    <div className="flex justify-between mb-4 text-sm">
                        <div>
                            <p><span className="font-semibold">Bill No:</span> {sale.billNumber}</p>
                            <p><span className="font-semibold">Customer:</span> {sale.customerName}</p>
                        </div>
                        <div>
                            <p className="text-right"><span className="font-semibold">Date:</span> {sale.date}</p>
                        </div>
                    </div>

                    <table className="w-full text-sm mb-4">
                        <thead>
                            <tr className="border-b-2 border-t-2">
                                <th className="text-left font-semibold py-2">Item</th>
                                <th className="text-center font-semibold py-2">Qty</th>
                                <th className="text-right font-semibold py-2">Rate</th>
                                <th className="text-right font-semibold py-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map(item => (
                                <tr key={item.batchId} className="border-b">
                                    <td className="py-2">{item.productName}</td>
                                    <td className="text-center py-2">{item.quantity}</td>
                                    <td className="text-right py-2">₹{item.mrp.toFixed(2)}</td>
                                    <td className="text-right py-2">₹{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="flex justify-end mt-4">
                        <div className="w-1/2">
                             <div className="flex justify-between font-bold text-lg">
                                <span>Grand Total:</span>
                                <span>₹{sale.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Close</button>
                    <button onClick={generatePdf} className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600">Download PDF</button>
                </div>
            </div>
        </div>
    );
};

export default BillDetailsModal;