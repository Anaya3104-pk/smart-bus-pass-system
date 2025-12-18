// src/components/BusTracking.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../lib/api';
import { io } from 'socket.io-client';

const BusTracking = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [myPass, setMyPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    loadData();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    try {
      const passRes = await api.get('/api/passes/my-passes');
      const activePass = (passRes.data || []).find(
        (p) => p.status === 'approved' && p.payment_status === 'success'
      );

      if (activePass) {
        setMyPass(activePass);
        await subscribeToRoute(activePass.route_id);
      } else {
        setBuses([]);
      }
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRoute = async (rId) => {
    try {
      const resp = await api.get(`/api/bus/live?routeId=${rId}`);
      setBuses(resp.data.buses || []);
    } catch (err) {
      console.error('Initial live fetch error:', err);
    }

    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL, {
        transports: ['websocket'],
        auth: {
          token: localStorage.getItem('token') || ''
        }
      });
    }

    const socket = socketRef.current;
    socket.emit('join-route', rId);

    socket.on('bus:location:update', (bus) => {
      // Only update if this bus belongs to the subscribed route
      if (bus.route_id && String(bus.route_id) !== String(rId)) return;
      
      setBuses(prev => {
        const idx = prev.findIndex(b => b.bus_id === bus.bus_id);
        if (idx === -1) {
          // New bus - fetch full bus details if needed
          return [...prev, { 
            bus_id: bus.bus_id,
            current_lat: bus.latitude,
            current_lng: bus.longitude,
            route_id: bus.route_id,
            last_updated: bus.timestamp
          }];
        }
        // Update existing bus
        const copy = [...prev];
        copy[idx] = { 
          ...copy[idx], 
          current_lat: bus.latitude,
          current_lng: bus.longitude,
          last_updated: bus.timestamp
        };
        return copy;
      });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading tracking...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button onClick={() => navigate('/dashboard')} className="mb-4 bg-primary-700 text-white px-4 py-2 rounded">Back to Dashboard</button>

      <h1 className="text-3xl font-bold mb-6">Track My Bus</h1>

      {!myPass && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="text-gray-700">You don't have an active pass. Apply for a pass to enable tracking.</p>
        </div>
      )}

      {myPass && (
        <>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-2">Your Route</h2>
            <p className="text-lg">{myPass.route_name}</p>
            <p className="text-gray-600">{myPass.start_point} - {myPass.end_point}</p>
            <p className="text-sm text-gray-500 mt-2">Automatically subscribed to live updates for this route.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Live Buses ({buses.length})</h2>

            {buses.length === 0 ? (
              <p className="text-gray-500">No buses currently tracking on this route</p>
            ) : (
              <div className="space-y-4">
                {buses.map((bus) => (
                  <div key={bus.bus_id} className="border p-4 rounded flex items-center justify-between">
                    <div>
                      <p className="font-bold">{bus.bus_number}</p>
                      <p className="text-sm text-gray-600">{bus.route_name}</p>
                      <p className="text-xs font-mono mt-2">
                        {bus.current_lat ? `${Number(bus.current_lat).toFixed(6)}, ${Number(bus.current_lng).toFixed(6)}` : 'Location not available'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <a
                        href={bus.current_lat ? `https://www.google.com/maps?q=${bus.current_lat},${bus.current_lng}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary-700 text-white px-4 py-2 rounded text-sm"
                      >
                        View on Map
                      </a>
                      <span className="text-xs text-gray-500">{bus.last_updated ? new Date(bus.last_updated).toLocaleTimeString() : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BusTracking;
