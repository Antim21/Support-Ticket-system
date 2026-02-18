import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import StatsDashboard from './components/StatsDashboard';
import TicketDetail from './components/TicketDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TicketList />} />
          <Route path="/new" element={<TicketForm />} />
          <Route path="/stats" element={<StatsDashboard />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;