import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './ItemList.css';

const ItemList = ({ items, loading, onItemDeleted, onItemUpdated }) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const getPassword = () => {
    const saved = localStorage.getItem('credentials');
    return saved ? JSON.parse(saved).password : '';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await api.deleteItem(id, user.username, getPassword());
      onItemDeleted();
    } catch (error) {
      alert('Failed to delete item: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      location: item.location,
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
    });
  };

  const handleSave = async (id) => {
    try {
      await api.updateItem(id, editForm, user.username, getPassword());
      setEditingId(null);
      onItemUpdated();
    } catch (error) {
      alert('Failed to update item: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) {
    return <div className="loading">Loading items...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="card">
        <p>No items in your pantry. Scan a barcode to get started!</p>
      </div>
    );
  }

  return (
    <div className="item-list">
      <h2>Your Pantry ({items.length} items)</h2>
      <div className="items-grid">
        {items.map(item => (
          <div key={item._id} className="item-card">
            {editingId === item._id ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <select
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  >
                    <option value="Pantry">Pantry</option>
                    <option value="Fridge">Fridge</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={editForm.expiryDate}
                    onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                  />
                </div>
                <div className="edit-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSave(item._id)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3>{item.name}</h3>
                <div className="item-details">
                  <p><strong>Barcode:</strong> {item.barcode}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Location:</strong> {item.location}</p>
                  {item.expiryDate && (
                    <p><strong>Expiry:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="item-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;

