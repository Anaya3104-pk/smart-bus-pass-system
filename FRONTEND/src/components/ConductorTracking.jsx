// src/components/ConductorTracking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const ConductorTracking = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [busId, setBusId] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [error, setError] = useState('');
  const [watchId, setWatchId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/conductor/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'conductor') {
      navigate('/conductor/login');
      return;
    }
    setUser(parsedUser);
  }, [navigate, token]);

  const startTracking = () => {
    if (!busId) { setError('Please select a bus first'); return; }
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }

    setError('');
    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 0,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        };

        setCurrentLocation(location);
        sendLocationUpdate(location);

        setLocationHistory(prev => [{
          ...location,
          time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 19)]);
      },
      (err) => {
        console.error('GPS Error:', err);
        setError(`GPS Error: ${err.message}`);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  const sendLocationUpdate = async (location) => {
    try {
      await api.post('/api/bus/update-location', {
        busId: parseInt(busId),
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed || 0
      });
    } catch (err) {
      console.error('Error sending location:', err);
    }
  };

  const manualUpdate = () => {
    if (!busId) { setError('Please select a bus first'); return; }
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 0
        };
        setCurrentLocation(location);
        sendLocationUpdate(location);
        alert('Location sent successfully!');
      },
      (err) => setError(`GPS Error: ${err.message}`)
    );
  };

  const handleLogout = () => {
    stopTracking();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/conductor/login');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🚌</div>
              <div>
                <h1 className="text-2xl font-bold">Bus GPS Tracker</h1>
                <p className="text-sm text-blue-100">Conductor Panel</p>
              </div>
            </div>
            <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user.fullName}!</h2>
          <p className="text-gray-600">Select your bus and start GPS tracking</p>
        </div>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Select Your Bus</h3>
          <select value={busId} onChange={(e) => setBusId(e.target.value)}
            disabled={isTracking}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Select Bus --</option>
            {/* TODO: replace the static list with dynamic fetch from /api/buses or /api/conductor/assigned-buses */}
            <option value="1">BUS-101 (Route 1)</option>
            <option value="2">BUS-202 (Route 1)</option>
            <option value="3">BUS-303 (Route 2)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {!isTracking ? (
            <button onClick={startTracking} disabled={!busId} className="bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50">▶ Start Tracking</button>
          ) : (
            <button onClick={stopTracking} className="bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl font-bold text-lg shadow-lg">⏹ Stop Tracking</button>
          )}

          <button onClick={manualUpdate} disabled={!busId || isTracking} className="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50">📍 Send Location Now</button>
        </div>

        {currentLocation && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-green-800 mb-4">📍 Current Location {isTracking && <span className="text-sm animate-pulse text-red-600">● LIVE</span>}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-gray-600">Latitude:</p><p className="font-mono font-bold text-lg">{currentLocation.latitude.toFixed(6)}</p></div>
              <div><p className="text-gray-600">Longitude:</p><p className="font-mono font-bold text-lg">{currentLocation.longitude.toFixed(6)}</p></div>
              <div><p className="text-gray-600">Speed:</p><p className="font-mono font-bold text-lg">{currentLocation.speed ? `${currentLocation.speed.toFixed(1)} m/s` : '0 m/s'}</p></div>
              <div><p className="text-gray-600">Accuracy:</p><p className="font-mono font-bold text-lg">{currentLocation.accuracy ? `±${currentLocation.accuracy.toFixed(0)}m` : 'N/A'}</p></div>
            </div>
          </div>
        )}

        {locationHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Recent Updates ({locationHistory.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {locationHistory.map((loc, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                  <div><span className="font-mono">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</span></div>
                  <div className="text-gray-600">{loc.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">📱 How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Select your bus from the dropdown</li>
            <li>Click Start Tracking to begin automatic updates</li>
            <li>Keep this page open while driving</li>
            <li>Students can see your bus moving on their map</li>
            <li>Click Stop Tracking when finished</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ConductorTracking;
