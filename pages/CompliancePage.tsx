import React from 'react';

const CompliancePage: React.FC = () => {
    const scheduleH1Log = [
        { date: '2023-10-26', patient: 'Ramesh Kumar', doctor: 'Dr. A. Gupta', drug: 'Alprax 0.5mg', qty: 10 },
        { date: '2023-10-25', patient: 'Sunita Sharma', doctor: 'Dr. B. Verma', drug: 'Clonafit 0.25mg', qty: 15 },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Compliance Registers</h1>

            <div className="bg-white p-8 rounded-xl shadow-md mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Schedule H/H1 Register</h2>
                    <button className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 text-sm">
                        Export Register
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Drug Issued</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleH1Log.map((log, index) => (
                                <tr key={index}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{log.date}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{log.patient}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{log.doctor}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{log.drug}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{log.qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Narcotics / Controlled Substance Logs</h2>
                <p className="text-gray-500">This module is under development and will provide detailed tracking for all controlled substances as per regulatory requirements.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Recall Management</h2>
                <p className="text-gray-500">This module is under development. It will allow you to flag specific batches for recall, prevent their sale, and generate reports for auditing purposes.</p>
            </div>
        </div>
    );
};

export default CompliancePage;
