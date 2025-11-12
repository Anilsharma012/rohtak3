import React from 'react';

// Card for key metrics
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between transition-transform transform hover:-translate-y-1">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
            {icon}
        </div>
    </div>
);

// Card for quick actions
const ActionButton: React.FC<{ title: string; icon: React.ReactNode; }> = ({ title, icon }) => (
    <button className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center text-gray-700 hover:bg-gray-50 hover:shadow-lg transition">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-2">
            {icon}
        </div>
        <span className="font-semibold text-sm">{title}</span>
    </button>
);


const DashboardPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {/* Key Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard 
                    title="Today's Sales" 
                    value="$1,280" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    color="bg-green-500" 
                />
                <StatCard 
                    title="Today's Bills" 
                    value="85" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    color="bg-blue-500" 
                />
                 <StatCard 
                    title="Today's Returns" 
                    value="4" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" /></svg>}
                    color="bg-purple-500"
                />
                <StatCard 
                    title="Today's Purchases" 
                    value="12" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                    color="bg-indigo-500" 
                />
                <StatCard 
                    title="Expiry Alerts" 
                    value="23" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="bg-yellow-500" 
                />
            </div>

            {/* Quick Actions Section */}
             <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ActionButton title="Add New Product" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} />
                    <ActionButton title="Create New Bill" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} />
                    <ActionButton title="Start Stock Audit" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
                    <ActionButton title="View Reorder List" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>} />
                </div>
            </div>

            {/* Charts and Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Weekly Sales Trend</h2>
                    <div className="h-64 flex items-end justify-around p-4">
                         {/* This is a static placeholder for a chart */}
                        <div className="flex flex-col items-center"><div className="w-8 h-2/5 bg-blue-400 rounded-t-lg" title="Mon: $800"></div><span className="text-xs mt-1 text-gray-500">Mon</span></div>
                        <div className="flex flex-col items-center"><div className="w-8 h-3/5 bg-blue-400 rounded-t-lg" title="Tue: $1200"></div><span className="text-xs mt-1 text-gray-500">Tue</span></div>
                        <div className="flex flex-col items-center"><div className="w-8 h-4/5 bg-blue-500 rounded-t-lg" title="Wed: $1600"></div><span className="text-xs mt-1 text-gray-500">Wed</span></div>
                        <div className="flex flex-col items-center"><div className="w-8 h-3/4 bg-blue-400 rounded-t-lg" title="Thu: $1500"></div><span className="text-xs mt-1 text-gray-500">Thu</span></div>
                        <div className="flex flex-col items-center"><div className="w-8 h-full bg-blue-600 rounded-t-lg" title="Fri: $2000"></div><span className="text-xs mt-1 text-gray-500">Fri</span></div>
                        <div className="flex flex-col items-center"><div className="w-8 h-1/2 bg-blue-400 rounded-t-lg" title="Sat: $1000"></div><span className="text-xs mt-1 text-gray-500">Sat</span></div>
                        <div className="flex flex-col items-center"><div className="w-8 h-1/4 bg-blue-300 rounded-t-lg" title="Sun: $500"></div><span className="text-xs mt-1 text-gray-500">Sun</span></div>
                    </div>
                </div>

                {/* Top Products & Low Stock */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Selling Products</h2>
                        <ul>
                            <li className="flex justify-between py-2 border-b"><span className="text-gray-600">Calpol 500mg</span><span className="font-semibold">120 units</span></li>
                            <li className="flex justify-between py-2 border-b"><span className="text-gray-600">Cetzine 10mg</span><span className="font-semibold">95 units</span></li>
                            <li className="flex justify-between pt-2"><span className="text-gray-600">Mox 250mg</span><span className="font-semibold">80 units</span></li>
                        </ul>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                         <h2 className="text-xl font-semibold text-gray-700 mb-4">Low Stock Alerts</h2>
                        <ul>
                            <li className="flex justify-between py-2 border-b"><span className="text-red-600">Vicks Vaporub</span><span className="font-semibold text-red-600">5 units left</span></li>
                            <li className="flex justify-between py-2 border-b"><span className="text-yellow-600">Band-Aid Assorted</span><span className="font-semibold text-yellow-600">12 units left</span></li>
                            <li className="flex justify-between pt-2"><span className="text-red-600">Crocin Advance</span><span className="font-semibold text-red-600">3 units left</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
