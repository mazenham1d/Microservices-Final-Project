import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const createAxiosInstance = (username, password) => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {
      username,
      password
    }
  });

  return instance;
};

export const api = {
  login: async (username, password) => {
    const instance = createAxiosInstance(username, password);
    const response = await instance.post('/api/auth/login');
    return response.data;
  },

  scanBarcode: async (barcode, username, password) => {
    const instance = createAxiosInstance(username, password);
    const response = await instance.post('/api/pantry/scan', { barcode });
    return response.data;
  },

  getItems: async (username, password) => {
    const instance = createAxiosInstance(username, password);
    const response = await instance.get('/api/pantry/items');
    return response.data;
  },

  addItem: async (item, username, password) => {
    const instance = createAxiosInstance(username, password);
    const response = await instance.post('/api/pantry/items', item);
    return response.data;
  },

  updateItem: async (id, item, username, password) => {
    const instance = createAxiosInstance(username, password);
    const response = await instance.put(`/api/pantry/items/${id}`, item);
    return response.data;
  },

  deleteItem: async (id, username, password) => {
    const instance = createAxiosInstance(username, password);
    const response = await instance.delete(`/api/pantry/items/${id}`);
    return response.data;
  },

  getAnalytics: async (username, password) => {
    const instance = createAxiosInstance(username, password);
    const response = await instance.get('/api/admin/analytics');
    return response.data;
  },

  getRecipeSuggestions: async (username, password) => {
    const instance = createAxiosInstance(username, password);
    const response = await instance.post('/api/recipes/suggestions');
    return response.data;
  }
};

