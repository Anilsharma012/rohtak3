import React from 'react';

const ReportCard: React.FC<{ title: string, description: string }> = ({ title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-transform transform">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <button className="w-full text-center px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition">
            Generate Report
        </button>
    </div>
);


const ReportsPage: React.FC = () => {
    const reports = [
        { title: 'Stock Valuation Report', description: 'Current stock value based on purchase price or MRP.' },
        { title: 'Near-Expiry Report', description: 'List of all batches expiring in the next 30/60/90 days.' },
        { title: 'Non-Moving Stock', description: 'Identify products that have not been sold in a specified period.' },
        { title: 'Sales Summary Report', description: 'Item-wise, bill-wise, or doctor-wise sales analytics.' },
        { title: 'Sales by Product', description: 'Track performance and quantities sold for each product.' },
        { title: 'Purchase History', description: 'Detailed log of all purchase invoices from suppliers.' },
        { title: 'Stock Ledger Summary', description: 'A summarized view of all stock movements (In/Out/Adjust).' },
        { title: 'GST Summary Report', description: 'Consolidated report of GST collected and paid for a period.' },
        { title: 'Supplier Ledger', description: 'View outstanding payments and transaction history for suppliers.' },
        { title: 'Customer Ledger', description: 'Track receivables and payment history for credit customers.' },
        { title: 'Reorder Suggestions', description: 'Auto-generated list of products that need to be reordered.' },
        { title: 'Profitability Report', description: 'Analyze profit margins by product, brand, or category.' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reports.map(report => (
                    <ReportCard key={report.title} {...report} />
                ))}
            </div>
        </div>
    );
};

export default ReportsPage;
