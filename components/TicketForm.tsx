import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCategory, TicketPriority, TicketStatus } from '../types';
import { classifyTicketDescription } from '../services/geminiService';
import { createTicket } from '../services/mockDataService';

const TicketForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.GENERAL);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.LOW);
  
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classificationDone, setClassificationDone] = useState(false);

  // Debounce logic for LLM call
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (description.length > 10 && !classificationDone) {
        setIsClassifying(true);
        try {
          const result = await classifyTicketDescription(description);
          setCategory(result.suggested_category);
          setPriority(result.suggested_priority);
          setClassificationDone(true);
        } catch (e) {
          console.error("Auto-classification failed", e);
        } finally {
          setIsClassifying(false);
        }
      }
    }, 1500); // Wait 1.5s after typing stops

    return () => {
      clearTimeout(handler);
    };
  }, [description, classificationDone]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    // Reset classification if user clears or significantly changes description
    if (e.target.value.length < 10) {
      setClassificationDone(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createTicket({
        title,
        description,
        category,
        priority,
        status: TicketStatus.OPEN
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-primary-50 px-6 py-4 border-b border-primary-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primary-900">Create New Support Ticket</h2>
        {isClassifying && (
           <div className="flex items-center space-x-2 text-sm text-primary-700 animate-pulse">
             <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <span>AI analyzing...</span>
           </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="title"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
            placeholder="Brief summary of the issue"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <div className="relative">
             <textarea
              id="description"
              required
              rows={5}
              value={description}
              onChange={handleDescriptionChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              placeholder="Please describe your issue in detail..."
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
               {isClassifying ? 'AI Suggesting categories...' : 'Type to get AI suggestions'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`transition-all duration-300 ${classificationDone ? 'ring-2 ring-indigo-100 rounded-md p-2 -m-2 bg-indigo-50/30' : ''}`}>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Category</span>
              {classificationDone && <span className="text-xs text-indigo-600 font-semibold">✨ AI Suggested</span>}
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border bg-white"
            >
              {Object.values(TicketCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={`transition-all duration-300 ${classificationDone ? 'ring-2 ring-indigo-100 rounded-md p-2 -m-2 bg-indigo-50/30' : ''}`}>
             <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Priority</span>
              {classificationDone && <span className="text-xs text-indigo-600 font-semibold">✨ AI Suggested</span>}
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border bg-white"
            >
              {Object.values(TicketPriority).map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;