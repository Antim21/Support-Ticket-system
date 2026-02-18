import React from 'react';
import { TicketStatus, TicketPriority, TicketCategory } from '../types';

interface BadgeProps {
  type: 'status' | 'priority' | 'category';
  value: string;
  className?: string;
}

const StatusBadge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  let colorClass = 'bg-gray-100 text-gray-800';

  if (type === 'status') {
    switch (value) {
      case TicketStatus.OPEN:
        colorClass = 'bg-green-100 text-green-800';
        break;
      case TicketStatus.IN_PROGRESS:
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case TicketStatus.RESOLVED:
        colorClass = 'bg-purple-100 text-purple-800';
        break;
      case TicketStatus.CLOSED:
        colorClass = 'bg-gray-100 text-gray-600';
        break;
    }
  } else if (type === 'priority') {
    switch (value) {
      case TicketPriority.LOW:
        colorClass = 'bg-blue-50 text-blue-700 border border-blue-200';
        break;
      case TicketPriority.MEDIUM:
        colorClass = 'bg-yellow-50 text-yellow-700 border border-yellow-200';
        break;
      case TicketPriority.HIGH:
        colorClass = 'bg-orange-50 text-orange-700 border border-orange-200';
        break;
      case TicketPriority.CRITICAL:
        colorClass = 'bg-red-50 text-red-700 border border-red-200';
        break;
    }
  } else if (type === 'category') {
     colorClass = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  }

  const formatValue = (val: string) => {
    return val.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {formatValue(value)}
    </span>
  );
};

export default StatusBadge;