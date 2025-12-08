import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const getPassword = () => {
    const saved = localStorage.getItem('credentials');
    return saved ? JSON.parse(saved).password : '';
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await api.getAnalytics(user.username, getPassword());
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user.role === 'admin') {
      loadAnalytics();
      const interval = setInterval(loadAnalytics, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="card">No analytics data available</div>;
  }

  return (
    <div className="admin-analytics card">
      <h2>System Analytics</h2>
      
      <div className="analytics-overview">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p className="stat-value">{analytics.overview.totalRequests}</p>
        </div>
        <div className="stat-card">
          <h3>Error Rate</h3>
          <p className="stat-value">{analytics.overview.errorRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Avg Response Time</h3>
          <p className="stat-value">{analytics.overview.avgResponseTime}ms</p>
        </div>
        <div className="stat-card">
          <h3>Errors</h3>
          <p className="stat-value">{analytics.overview.errorCount}</p>
        </div>
      </div>

      <div className="analytics-section">
        <h3>Top Endpoints</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Requests</th>
              <th>Avg Response Time</th>
            </tr>
          </thead>
          <tbody>
            {analytics.endpoints.map((endpoint, idx) => (
              <tr key={idx}>
                <td>{endpoint.endpoint}</td>
                <td>{endpoint.count}</td>
                <td>{endpoint.avgResponseTime}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="analytics-section">
        <h3>User Activity</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Requests</th>
            </tr>
          </thead>
          <tbody>
            {analytics.users.map((userStat, idx) => (
              <tr key={idx}>
                <td>{userStat.user}</td>
                <td>{userStat.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {analytics.errors.length > 0 && (
        <div className="analytics-section">
          <h3>Error Breakdown</h3>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Status Code</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {analytics.errors.map((error, idx) => (
                <tr key={idx}>
                  <td>{error.statusCode}</td>
                  <td>{error.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;

