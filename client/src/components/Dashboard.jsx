import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Scanner from './Scanner';
import ItemList from './ItemList';
import AdminAnalytics from './AdminAnalytics';
import RecipeSuggestions from './RecipeSuggestions';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState('pantry');
  const [filter, setFilter] = useState({ location: '', category: '' });

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await api.getItems(user.username, getPassword());
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPassword = () => {
    const saved = localStorage.getItem('credentials');
    return saved ? JSON.parse(saved).password : '';
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleItemAdded = () => {
    loadItems();
    setShowScanner(false);
  };

  const handleItemDeleted = () => {
    loadItems();
  };

  const handleItemUpdated = () => {
    loadItems();
  };

  const filteredItems = items.filter(item => {
    if (filter.location && item.location !== filter.location) return false;
    if (filter.category && item.category !== filter.category) return false;
    return true;
  });

  const locations = [...new Set(items.map(item => item.location))];
  const categories = [...new Set(items.map(item => item.category))];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Smart Pantry</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {user.username} ({user.role})</span>
          {user.role === 'admin' && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
          )}
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="container">
        {showAnalytics && user.role === 'admin' && (
          <AdminAnalytics />
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pantry' ? 'active' : ''}`}
            onClick={() => setActiveTab('pantry')}
          >
            My Pantry
          </button>
          <button
            className={`tab ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            Recipe Ideas
          </button>
        </div>

        {activeTab === 'pantry' && (
          <>
            <div className="dashboard-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowScanner(!showScanner)}
              >
                {showScanner ? 'Cancel Scan' : 'Scan Barcode'}
              </button>
            </div>

            {showScanner && (
              <Scanner
                onItemAdded={handleItemAdded}
                onCancel={() => setShowScanner(false)}
              />
            )}

            <div className="filters">
              <div className="form-group">
                <label>Filter by Location:</label>
                <select
                  value={filter.location}
                  onChange={(e) => setFilter({ ...filter, location: e.target.value })}
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Filter by Category:</label>
                <select
                  value={filter.category}
                  onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <ItemList
              items={filteredItems}
              loading={loading}
              onItemDeleted={handleItemDeleted}
              onItemUpdated={handleItemUpdated}
            />
          </>
        )}

        {activeTab === 'recipes' && (
          <RecipeSuggestions />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

