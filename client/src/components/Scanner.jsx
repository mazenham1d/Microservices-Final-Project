import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Scanner.css';

const Scanner = ({ onItemAdded, onCancel }) => {
  const { user } = useAuth();
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productInfo, setProductInfo] = useState(null);
  const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'camera'
  const [cameraStarted, setCameraStarted] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState('Uncategorized');
  const [manualLocation, setManualLocation] = useState('Pantry');
  const html5QrCodeRef = useRef(null);

  const getPassword = () => {
    const saved = localStorage.getItem('credentials');
    return saved ? JSON.parse(saved).password : '';
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError('');
    try {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778
        },
        async (decodedText) => {
          setBarcode(decodedText);
          await stopCamera();
          await handleScanBarcode(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors
        }
      );
      
      setCameraStarted(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to start camera. Please check camera permissions or use manual entry.');
      setCameraStarted(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && cameraStarted) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
    }
    setCameraStarted(false);
  };

  const handleModeChange = async (mode) => {
    if (mode === 'manual' && cameraStarted) {
      await stopCamera();
    }
    setScanMode(mode);
    setError('');
    setProductInfo(null);
  };

  const handleScanBarcode = async (code) => {
    const barcodeToScan = code || barcode;
    setError('');
    setProductInfo(null);
    
    if (!barcodeToScan.trim()) {
      setError('Please enter a barcode');
      return;
    }

    try {
      setLoading(true);
      const data = await api.scanBarcode(barcodeToScan, user.username, getPassword());
      setProductInfo(data);
      
      // Pre-fill manual fields if product was found
      if (data.found && data.name) {
        setManualName(data.name);
        setManualCategory(data.category || 'Uncategorized');
      } else {
        setManualName('');
        setManualCategory('Uncategorized');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to scan barcode');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    await handleScanBarcode();
  };

  const handleAddToPantry = async () => {
    if (!productInfo) return;

    // Validate that we have a name
    const itemName = manualName.trim() || productInfo.name || productInfo.productInfo?.name;
    if (!itemName) {
      setError('Please enter a product name');
      return;
    }

    try {
      setLoading(true);
      const item = {
        barcode: productInfo.barcode,
        name: itemName,
        quantity: productInfo.quantity || 1,
        category: manualCategory || productInfo.category || 'Uncategorized',
        location: manualLocation
      };

      if (productInfo._id) {
        await api.updateItem(productInfo._id, item, user.username, getPassword());
      } else {
        await api.addItem(item, user.username, getPassword());
      }
      
      onItemAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await stopCamera();
    onCancel();
  };

  return (
    <div className="scanner-card card">
      <h2>Scan Barcode</h2>
      
      <div className="scan-mode-toggle">
        <button
          className={`mode-btn ${scanMode === 'manual' ? 'active' : ''}`}
          onClick={() => handleModeChange('manual')}
        >
          Manual Entry
        </button>
        <button
          className={`mode-btn ${scanMode === 'camera' ? 'active' : ''}`}
          onClick={() => handleModeChange('camera')}
        >
          Camera Scan
        </button>
      </div>

      {scanMode === 'camera' && (
        <div className="camera-section">
          <div id="qr-reader" className="camera-preview"></div>
          {!cameraStarted && (
            <button
              className="btn btn-primary start-camera-btn"
              onClick={startCamera}
              disabled={loading}
            >
              Start Camera
            </button>
          )}
          {cameraStarted && (
            <div className="camera-instructions">
              <p>Point your camera at a barcode</p>
              <button
                className="btn btn-secondary"
                onClick={stopCamera}
              >
                Stop Camera
              </button>
            </div>
          )}
        </div>
      )}

      {scanMode === 'manual' && (
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
          <div className="scanner-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Scanning...' : 'Lookup Product'}
            </button>
          </div>
        </form>
      )}

      {error && <div className="error">{error}</div>}

      {productInfo && (
        <div className="product-info">
          <h3>
            {productInfo.found ? 'Product Found!' : 'Barcode Scanned'}
          </h3>
          
          {productInfo.found && productInfo.source && (
            <p className="source-notice">Source: {productInfo.source}</p>
          )}
          
          {!productInfo.found && (
            <p className="not-found-notice">
              Product not in database. Please enter details below:
            </p>
          )}

          <div className="product-form">
            <div className="form-group">
              <label>Product Name {!productInfo.found && '*'}</label>
              <input
                type="text"
                value={manualName || productInfo.name || ''}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Enter product name"
                required={!productInfo.found}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                placeholder="e.g., Snacks, Beverages, Dairy"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <select
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
              >
                <option value="Pantry">Pantry</option>
                <option value="Fridge">Fridge</option>
                <option value="Freezer">Freezer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="product-details">
              <p><strong>Barcode:</strong> {productInfo.barcode}</p>
              {productInfo.brand && (
                <p><strong>Brand:</strong> {productInfo.brand}</p>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary add-btn"
            onClick={handleAddToPantry}
            disabled={loading}
          >
            {loading ? 'Adding...' : (productInfo._id ? 'Update in Pantry' : 'Add to Pantry')}
          </button>
        </div>
      )}

      <div className="scanner-actions bottom-actions">
        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
      </div>

      <div className="scanner-hint">
        <p><strong>Tips:</strong></p>
        <p>• Scan any barcode - add products even if not in database</p>
        <p>• Known barcodes: 3017620422003 (Nutella), 5449000000996 (Coca-Cola)</p>
        <p>• Works with EAN-13, UPC, and other common formats</p>
      </div>
    </div>
  );
};

export default Scanner;
