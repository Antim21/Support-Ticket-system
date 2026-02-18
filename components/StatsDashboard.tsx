import React, { useEffect, useState } from 'react';
import { fetchStats } from '../services/mockDataService';
import { TicketStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#60a5fa', '#34d399', '#f87171', '#fbbf24'];
const PRIORITY_COLORS = {
  low: '#60a5fa',
  medium: '#fbbf24',
  high: '#f97316',
  critical: '#ef4444'
};

const StatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) return <div className="p-10 text-center text-gray-500">Loading analytics...</div>;

  const categoryData = Object.entries(stats.category_breakdown).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(stats.priority_breakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_tickets}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Open Tickets</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">{stats.open_tickets}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-sm font-medium text-gray-500">Avg. Tickets / Day</h3>
             <p className="mt-2 text-3xl font-bold text-gray-900">{stats.avg_tickets_per_day}</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4 w-full text-left">Tickets by Category</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4 w-full text-left">Tickets by Priority</h3>
             <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)} />
                  <RechartsTooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
       </div>
    </div>
  );
};

export default StatsDashboard;