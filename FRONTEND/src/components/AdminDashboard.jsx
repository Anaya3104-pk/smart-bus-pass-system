// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../lib/api";

import { 
  FaUserShield, 
  FaChartBar, 
  FaClock, 
  FaCheckCircle, 
  FaTimes,
  FaMoneyBillWave,
  FaChartLine,
  FaSignOutAlt,
  FaRedoAlt,
  FaUserCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingPasses, setPendingPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchPendingPasses();
  }, [navigate, token]);

  const fetchPendingPasses = async () => {
    try {
      const response = await api.get("/api/admin/passes/pending");

      setPendingPasses(response.data);
      
      setStats({
        pending: response.data.length,
        total: response.data.length,
        approved: 0,
        rejected: 0
      });
    } catch (err) {
      console.error('Error fetching passes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (passId) => {
    setActionLoading(passId);
    try {
  await api.put(`/api/admin/passes/${passId}/approve`);
  
  
      setPendingPasses(pendingPasses.filter(pass => pass.pass_id !== passId));
      
      setStats({
        ...stats,
        pending: stats.pending - 1,
        approved: stats.approved + 1
      });
      
      alert('Pass approved successfully! ✅');
    } catch (err) {
      alert('Error approving pass: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (passId) => {
    const reason = prompt('Enter reason for rejection (optional):');
    
    setActionLoading(passId);
    try {
      try {
  await api.put(`/api/admin/passes/${passId}/reject`, { reason });


  
  // optionally refresh list
  fetchPendingPasses();
} catch (err) {
  console.error("Approve failed:", err);
}

      
      setPendingPasses(pendingPasses.filter(pass => pass.pass_id !== passId));
      
      setStats({
        ...stats,
        pending: stats.pending - 1,
        rejected: stats.rejected + 1
      });
      
      alert('Pass rejected ❌');
    } catch (err) {
      alert('Error rejecting pass: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
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
                <FaUserShield className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Bus Pass Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-gray-600" />
                  <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                </div>
                <p className="text-xs text-primary-600 font-semibold">Administrator</p>
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
            <FaUserShield className="text-9xl" />
          </div>
          <div className="relative">
            <h2 className="text-4xl font-bold mb-3">Admin Control Panel</h2>
            <p className="text-blue-100 text-lg">Review and approve bus pass applications</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Applications</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <FaChartBar className="text-blue-600 text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending Review</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-xl">
                <FaClock className="text-yellow-600 text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Approved Today</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-xl">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Rejected Today</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-xl">
                <FaTimes className="text-red-600 text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/cash-payments')}
              className="bg-green-50 hover:bg-green-100 p-6 rounded-xl transition-all duration-200 border-2 border-green-200 hover:border-green-400 hover:shadow-lg group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-500 p-4 rounded-full group-hover:scale-110 transition-transform duration-200">
                  <FaMoneyBillWave className="text-white text-3xl" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-gray-800">Cash Payments</p>
                  <p className="text-sm text-gray-600">Confirm cash received</p>
                </div>
              </div>
            </button>

            <button className="bg-blue-50 hover:bg-blue-100 p-6 rounded-xl transition-all duration-200 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg group">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500 p-4 rounded-full group-hover:scale-110 transition-transform duration-200">
                  <FaChartLine className="text-white text-3xl" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-gray-800">Analytics</p>
                  <p className="text-sm text-gray-600">View reports & stats</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Pending Pass Applications</h3>
            <button
              onClick={fetchPendingPasses}
              className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <FaRedoAlt />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading applications...</p>
            </div>
          ) : pendingPasses.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-green-600 text-5xl" />
              </div>
              <p className="text-gray-500 text-xl font-semibold">No pending applications</p>
              <p className="text-sm text-gray-400 mt-3">All caught up! Great work! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPasses.map((pass) => (
                <div
                  key={pass.pass_id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary-700 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                          {pass.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
<h4 className="text-xl font-bold text-gray-800">{pass.full_name}</h4>
<p className="text-sm text-gray-600 mt-1">📧 {pass.email}</p>
<p className="text-sm text-gray-600">📱 {pass.phone}</p>
<p className="text-xs text-gray-500 mt-2">
Applied: {new Date(pass.created_at).toLocaleDateString('en-IN', {
day: 'numeric',
month: 'short',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
})}
</p>
</div>
</div>
</div>{/* Route Info */}
                <div className="flex-1 bg-primary-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-2">SELECTED ROUTE</p>
                  <h5 className="font-bold text-lg text-gray-800 mb-2">{pass.route_name}</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    🚌 {pass.start_point} → {pass.end_point}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-primary-200">
                    <span className="text-sm text-gray-600">Monthly Fare:</span>
                    <span className="text-2xl font-bold text-primary-700">₹{pass.fare}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 justify-center min-w-[180px]">
                  <button
                    onClick={() => handleApprove(pass.pass_id)}
                    disabled={actionLoading === pass.pass_id}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {actionLoading === pass.pass_id ? 'Processing...' : (
                      <>
                        <FaCheckCircle />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(pass.pass_id)}
                    disabled={actionLoading === pass.pass_id}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {actionLoading === pass.pass_id ? 'Processing...' : (
                      <>
                        <FaTimes />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>);
};
export default AdminDashboard;