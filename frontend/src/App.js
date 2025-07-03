import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ComparisonPage from './pages/ComparisonPage';
import './App.css'; // Залишаємо стилі

function App() {
  return (
    <Router>
      <div className="container">
        <header>
          <h1>🔬 Experiment Tracker Prototype</h1>
          <nav style={{ marginBottom: '20px' }}>
            <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Dashboard</Link>
            <Link to="/compare" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Comparison</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;