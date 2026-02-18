import React, { useState, useEffect } from 'react';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, TicketFilters } from '../types';
import { fetchTickets, updateTicketStatus } from '../services/mockDataService';
import StatusBadge from './StatusBadge';
import { Link } from 'react-router-dom';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TicketFilters>({});
  
  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchTickets(filters);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const handleStatusChange = async (id: number, newStatus: TicketStatus) => {
    try {
      const updated = await updateTicketStatus(id, newStatus);
      setTickets(tickets.map(t => t.id === id ? updated : t));
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <Link to="/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
           + New Ticket
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search tickets..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select 
             className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
             onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select 
             className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
             onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
             {Object.values(TicketCategory).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
          <select 
             className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
             onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="all">All Priorities</option>
            {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No tickets found matching your filters.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
                    <Link to={`/tickets/${ticket.id}`} className="text-lg font-medium text-primary-600 truncate hover:text-primary-800">
                      {ticket.title}
                    </Link>
                    <StatusBadge type="priority" value={ticket.priority} />
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Link to={`/tickets/${ticket.id}`} className="block">
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm group-hover:text-gray-900">{ticket.description}</p>
                </Link>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-3">
                    <StatusBadge type="category" value={ticket.category} />
                    <StatusBadge type="status" value={ticket.status} />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                     <span className="text-xs text-gray-500 mr-2">Update Status:</span>
                     <div className="flex space-x-1">
                        {[TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED].map((status) => (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStatusChange(ticket.id, status)
                            }}
                            disabled={ticket.status === status}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all
                              ${ticket.status === status 
                                ? 'bg-primary-600 border-primary-600 text-white cursor-default ring-2 ring-offset-1 ring-primary-300' 
                                : 'bg-white border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-500'
                              }
                            `}
                            title={`Mark as ${status.replace('_', ' ')}`}
                          >
                             {status.charAt(0).toUpperCase()}
                          </button>
                        ))}
                     </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketList;