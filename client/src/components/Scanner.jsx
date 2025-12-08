import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Scanner.css';

const Scanner = ({ onItemAdded, onCancel }) => {
  const { user } = useAuth();
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productInfo, setProductInfo] = useState(null);

  const getPassword = () => {
    const saved = localStorage.getItem('credentials');
    return saved ? JSON.parse(saved).password : '';
  };

  const handleScan = async (e) => {
    e.preventDefault();
    setError('');
    setProductInfo(null);
    
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }

    try {
      setLoading(true);
      const data = await api.scanBarcode(barcode, user.username, getPassword());
      setProductInfo(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to scan barcode');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPantry = async () => {
    if (!productInfo) return;

    try {
      setLoading(true);
      const item = {
        barcode: productInfo.barcode,
        name: productInfo.name || productInfo.productInfo?.name,
        quantity: productInfo.quantity || 1,
        category: productInfo.category || productInfo.productInfo?.category || 'Uncategorized',
        location: productInfo.location || 'Pantry'
      };

      if (productInfo._id) {
        // Item already exists, update it
        await api.updateItem(productInfo._id, item, user.username, getPassword());
      } else {
        // New item
        await api.addItem(item, user.username, getPassword());
      }
      
      onItemAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scanner-card card">
      <h2>Scan Barcode</h2>
      <form onSubmit={handleScan}>
        <div className="form-group">
          <label>Barcode</label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode (e.g., 3017620422003)"
            disabled={loading}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="scanner-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Scanning...' : 'Scan'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>

      {productInfo && (
        <div className="product-info">
          <h3>Product Found</h3>
          <div className="product-details">
            <p><strong>Name:</strong> {productInfo.name || productInfo.productInfo?.name || 'N/A'}</p>
            <p><strong>Barcode:</strong> {productInfo.barcode}</p>
            <p><strong>Category:</strong> {productInfo.category || productInfo.productInfo?.category || 'N/A'}</p>
            {productInfo.productInfo?.brand && (
              <p><strong>Brand:</strong> {productInfo.productInfo.brand}</p>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddToPantry}
            disabled={loading}
          >
            {productInfo._id ? 'Update in Pantry' : 'Add to Pantry'}
          </button>
        </div>
      )}

      <div className="scanner-hint">
        <p><strong>Demo Barcodes:</strong></p>
        <p>3017620422003 (Nutella), 5449000000996 (Coca Cola), 3017620422003</p>
        <p>Try any 13-digit barcode from Open Food Facts database</p>
      </div>
    </div>
  );
};

export default Scanner;

