// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../lib/api";

import { 
  FaBus, 
  FaCheckCircle, 
  FaClock, 
  FaChartBar, 
  FaPlusCircle, 
  FaFileAlt, 
  FaMapMarkedAlt, 
  FaComments,
  FaHistory,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';
import Chatbot from './Chatbot';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activePasses: 0,
    pendingApplications: 0,
    totalTrips: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (err.response?.status === 401) {
    localStorage.clear();
    navigate("/login");
    return;
  }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const response = await api.get("/api/passes/my-passes");
      
      const passes = response.data;
      console.log('Fetched passes:', passes);
      
      if (!passes || passes.length === 0) {
        console.log('No passes found');
        return;
      }
      
      const now = new Date();
      const active = passes.filter(p => {
        const isApproved = p.status === 'approved';
        const isPaid = p.payment_status === 'success';
        const hasExpiry = p.expiry_date != null;
        const notExpired = hasExpiry ? new Date(p.expiry_date) > now : false;
        
        console.log(`Pass ${p.pass_id}: approved=${isApproved}, paid=${isPaid}, notExpired=${notExpired}`);
        
        return isApproved && isPaid && notExpired;
      });
      
      const pending = passes.filter(p => p.status === 'pending');
      
      console.log('Active passes count:', active.length);
      console.log('Pending passes count:', pending.length);
      
      setStats({
        activePasses: active.length,
        pendingApplications: pending.length,
        totalTrips: 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-primary-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-md">
                <FaBus className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Bus Pass System</h1>
                <p className="text-xs text-gray-500">Digital Transit Solution</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-600" />
                  <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                </div>
                <p className="text-xs text-gray-600 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-primary-700 rounded-2xl shadow-xl p-10 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <FaBus className="text-9xl" />
          </div>
          <div className="relative">
            <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
              Welcome back, {user.fullName}!
            </h2>
            <p className="text-blue-100 text-lg">Manage your bus pass and track buses in real-time</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Active Pass</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.activePasses}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-xl">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending Applications</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.pendingApplications}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-xl">
                <FaClock className="text-yellow-600 text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Trips</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalTrips}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <FaChartBar className="text-blue-600 text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/apply-pass')}
              className="bg-blue-50 hover:bg-blue-100 p-8 rounded-xl transition-all duration-200 text-center border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg group"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-blue-500 p-4 rounded-full group-hover:scale-110 transition-transform duration-200">
                  <FaPlusCircle className="text-white text-3xl" />
                </div>
              </div>
              <p className="font-bold text-gray-800 text-lg">Apply for Pass</p>
              <p className="text-xs text-gray-600 mt-2">Start new application</p>
            </button>

            <button 
              onClick={() => navigate('/my-passes')}
              className="bg-green-50 hover:bg-green-100 p-8 rounded-xl transition-all duration-200 text-center border-2 border-green-200 hover:border-green-400 hover:shadow-lg group"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-green-500 p-4 rounded-full group-hover:scale-110 transition-transform duration-200">
                  <FaFileAlt className="text-white text-3xl" />
                </div>
              </div>
              <p className="font-bold text-gray-800 text-lg">View My Passes</p>
              <p className="text-xs text-gray-600 mt-2">Check pass status</p>
            </button>

            <button 
              onClick={() => navigate('/apply-pass')}
              className="bg-orange-50 hover:bg-orange-100 p-8 rounded-xl transition-all duration-200 text-center border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg group"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-orange-500 p-4 rounded-full group-hover:scale-110 transition-transform duration-200">
                  <FaHistory className="text-white text-3xl" />
                </div>
              </div>
              <p className="font-bold text-gray-800 text-lg">Renew Pass</p>
              <p className="text-xs text-gray-600 mt-2">Extend validity</p>
            </button>
             
            <button
  type="button"
  onClick={() => navigate('/track-bus')}
  className="bg-purple-50 hover:bg-purple-100 p-8 rounded-xl transition-all duration-200 text-center border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg group"
>
  <div className="flex justify-center mb-4">
    <div className="bg-purple-500 p-4 rounded-full group-hover:scale-110 transition-transform duration-200">
      <FaMapMarkedAlt className="text-white text-3xl" />
    </div>
  </div>
  <p className="font-bold text-gray-800 text-lg">Track Bus</p>
  <p className="text-xs text-gray-600 mt-2">Real-time location</p>
</button>


          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="text-center py-16">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHistory className="text-gray-400 text-5xl" />
            </div>
            <p className="text-gray-500 text-xl font-semibold">No recent activity</p>
            <p className="text-sm text-gray-400 mt-3">Apply for your first bus pass to get started!</p>
            <button
              onClick={() => navigate('/apply-pass')}
              className="mt-6 bg-primary-700 hover:bg-primary-800 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Get Started →
            </button>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;