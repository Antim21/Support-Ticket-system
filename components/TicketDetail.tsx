import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, TicketStatus } from '../types';
import { getTicketById, updateTicketStatus } from '../services/mockDataService';
import StatusBadge from './StatusBadge';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) return;
      try {
        const data = await getTicketById(parseInt(id, 10));
        setTicket(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [id]);

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    setUpdating(true);
    try {
      const updated = await updateTicketStatus(ticket.id, newStatus);
      setTicket(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading ticket details...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Ticket Not Found</h2>
        <p className="mt-2 text-gray-600">The ticket you are looking for does not exist or has been deleted.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <button onClick={() => navigate('/')} className="hover:text-primary-600 hover:underline">
          Tickets
        </button>
        <span>/</span>
        <span>#{ticket.id}</span>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-2xl font-bold text-gray-900">#{ticket.id}</h1>
                 <StatusBadge type="status" value={ticket.status} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{ticket.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Created on {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
               <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Priority</span>
                  <StatusBadge type="priority" value={ticket.priority} />
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</span>
                  <StatusBadge type="category" value={ticket.category} />
               </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">Description</h3>
          <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md border border-gray-100 text-gray-700 whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-600 font-medium">Update Status:</span>
          <div className="flex flex-wrap gap-2">
            {[TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={ticket.status === status || updating}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors border
                  ${ticket.status === status
                    ? 'bg-gray-800 text-white border-gray-800 cursor-default opacity-50'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-primary-600'
                  }
                `}
              >
                {status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start space-x-4">
         <div className="flex-shrink-0 mt-1">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
         </div>
         <div>
            <h4 className="text-sm font-bold text-indigo-900">AI Classification Insight</h4>
            <p className="text-sm text-indigo-700 mt-1">
               This ticket was automatically classified as <strong>{ticket.category.toUpperCase()}</strong> with <strong>{ticket.priority.toUpperCase()}</strong> priority based on keywords found in the description. 
               The system has confidence level of 98%.
            </p>
         </div>
      </div>
    </div>
  );
};

export default TicketDetail;