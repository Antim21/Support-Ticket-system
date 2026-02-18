import { Ticket, TicketStats, TicketCategory, TicketPriority, TicketStatus, TicketFilters } from "../types";

const STORAGE_KEY = 'support_tickets_db';

const initializeData = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const initialTickets: Ticket[] = [
      {
        id: 1,
        title: "Login failure on main portal",
        description: "I cannot log in to my account. It says invalid password even though I just reset it.",
        category: TicketCategory.ACCOUNT,
        priority: TicketPriority.HIGH,
        status: TicketStatus.OPEN,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 2,
        title: "Invoice #4002 discrepancy",
        description: "My invoice shows a charge for a service I cancelled last month.",
        category: TicketCategory.BILLING,
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.IN_PROGRESS,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        title: "Feature request: Dark mode",
        description: "It would be nice to have a dark mode for the dashboard.",
        category: TicketCategory.GENERAL,
        priority: TicketPriority.LOW,
        status: TicketStatus.OPEN,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTickets));
  }
};

const getTicketsFromStorage = (): Ticket[] => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

const saveTicketsToStorage = (tickets: Ticket[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};

export const fetchTickets = async (filters: TicketFilters): Promise<Ticket[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let tickets = getTicketsFromStorage();

  if (filters.search) {
    const q = filters.search.toLowerCase();
    tickets = tickets.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q)
    );
  }

  if (filters.category) {
    tickets = tickets.filter(t => t.category === filters.category);
  }
  
  if (filters.priority) {
    tickets = tickets.filter(t => t.priority === filters.priority);
  }
  
  if (filters.status) {
    tickets = tickets.filter(t => t.status === filters.status);
  }

  return tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getTicketById = async (id: number): Promise<Ticket | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const tickets = getTicketsFromStorage();
  return tickets.find(t => t.id === id) || null;
};

export const createTicket = async (ticketData: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const tickets = getTicketsFromStorage();
  const newTicket: Ticket = {
    ...ticketData,
    id: Math.floor(Math.random() * 100000),
    created_at: new Date().toISOString()
  };
  tickets.push(newTicket);
  saveTicketsToStorage(tickets);
  return newTicket;
};

export const updateTicketStatus = async (id: number, status: TicketStatus): Promise<Ticket> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const tickets = getTicketsFromStorage();
  const idx = tickets.findIndex(t => t.id === id);
  if (idx === -1) throw new Error("Ticket not found");
  
  tickets[idx].status = status;
  saveTicketsToStorage(tickets);
  return tickets[idx];
};

export const fetchStats = async (): Promise<TicketStats> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const tickets = getTicketsFromStorage();
  
  const total = tickets.length;
  const open = tickets.filter(t => t.status === TicketStatus.OPEN).length;
  
  const dateMap = new Map<string, number>();
  tickets.forEach(t => {
    const date = t.created_at.split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  const days = dateMap.size || 1;
  const avg = Number((total / days).toFixed(1));

  const pBreakdown = {
    [TicketPriority.LOW]: 0,
    [TicketPriority.MEDIUM]: 0,
    [TicketPriority.HIGH]: 0,
    [TicketPriority.CRITICAL]: 0,
  };

  const cBreakdown = {
    [TicketCategory.BILLING]: 0,
    [TicketCategory.TECHNICAL]: 0,
    [TicketCategory.ACCOUNT]: 0,
    [TicketCategory.GENERAL]: 0,
  };

  tickets.forEach(t => {
    if (pBreakdown[t.priority] !== undefined) pBreakdown[t.priority]++;
    if (cBreakdown[t.category] !== undefined) cBreakdown[t.category]++;
  });

  return {
    total_tickets: total,
    open_tickets: open,
    avg_tickets_per_day: avg,
    priority_breakdown: pBreakdown,
    category_breakdown: cBreakdown
  };
};