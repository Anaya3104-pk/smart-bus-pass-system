// src/components/PaymentPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from "../lib/api";


const PaymentPage = () => {
  const navigate = useNavigate();
  const { passId } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPassDetails();
  }, [passId, token, navigate]);

  const fetchPassDetails = async () => {
    try {
      const response = await api.get("/api/passes/my-passes");
      const selectedPass = response.data.find(p => p.pass_id === parseInt(passId));
      if (!selectedPass) {
        alert('Pass not found!');
        navigate('/my-passes');
        return;
      }
      setPass(selectedPass);
    } catch (err) {
      console.error('Error:', err);
      alert('Error loading pass');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPayment = async () => {
    setProcessing(true);
    
    try {
      await axios.post(
        'http://localhost:5000/api/payments/test-payment',
        { 
          passId: pass.pass_id,
          amount: pass.fare,
          paymentMethod: 'online_test'
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert('🎉 Payment Successful! Your pass is now active!');
      navigate('/my-passes');
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    setProcessing(true);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/payments/cash-payment',
        { 
          passId: pass.pass_id,
          amount: pass.fare
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert('✅ Payment slip generated!\n\nReference: ' + response.data.referenceNumber + '\n\nVisit college office to pay cash.');
      navigate('/my-passes');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-4">Pass not found</p>
          <button
            onClick={() => navigate('/my-passes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>

      <nav className="bg-white shadow-lg border-b border-gray-200">
  <div className="max-w-6xl mx-auto px-4 py-4">
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate('/my-passes')}
        className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition duration-200"
      >
        <span className="text-2xl">←</span>
      </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Complete Payment</h1>
              <p className="text-xs text-gray-500">Choose your payment method</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pass Details</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{pass.route_name}</h3>
              <p className="text-sm text-gray-600">🚌 {pass.start_point} → {pass.end_point}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Pass Number:</span>
                <span className="font-mono font-semibold">{pass.pass_number}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">Approved</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Validity:</span>
                <span className="font-semibold">1 Month</span>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Amount to Pay:</span>
                <span className="text-4xl font-bold text-green-600">₹{pass.fare}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Payment Method</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
  type="button"
  onClick={() => setPaymentMethod('online')}
  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
    paymentMethod === 'online'
      ? 'border-primary-600 bg-blue-50 shadow-lg scale-105'
      : 'border-gray-200 hover:border-primary-300'
  }`}
>
                  <div className="text-4xl mb-3">💳</div>
                  <p className="font-bold text-gray-800">Online Payment</p>
                  <p className="text-xs text-gray-600 mt-1">UPI, Cards, Wallets</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
  paymentMethod === 'cash'
    ? 'border-green-600 bg-green-50 shadow-lg scale-105'
    : 'border-gray-200 hover:border-green-300'
}`}
                >
                  <div className="text-4xl mb-3">💵</div>
                  <p className="font-bold text-gray-800">Cash Payment</p>
                  <p className="text-xs text-gray-600 mt-1">Pay at office</p>
                </button>
              </div>

              {paymentMethod === 'online' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <p className="font-bold text-gray-800">Secure Online Payment</p>
                        <p className="text-xs text-gray-600">Instant activation</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>✅ UPI (Google Pay, PhonePe, Paytm)</p>
                      <p>✅ Credit/Debit Cards</p>
                      <p>✅ Net Banking</p>
                    </div>
                  </div>

                  <button
  onClick={handleTestPayment}
  disabled={processing}
  className="w-full bg-gradient-to-r from-primary-700 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
>
                    {processing ? 'Processing...' : `Pay ₹${pass.fare} Online`}
                  </button>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🏢</span>
                      <div>
                        <p className="font-bold text-gray-800">Pay at College Office</p>
                        <p className="text-xs text-gray-600">Office Hours: 9 AM - 5 PM</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-2">How it works:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Click Generate Payment Slip</li>
                        <li>Visit college office</li>
                        <li>Pay ₹{pass.fare} in cash</li>
                        <li>Admin activates your pass</li>
                      </ol>
                    </div>
                  </div>

                  <button
  onClick={handleCashPayment}
  disabled={processing}
  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
>
                    {processing ? 'Generating...' : '📄 Generate Payment Slip'}
                  </button>

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <p className="text-xs text-gray-700">
                      <strong>Note:</strong> Pass activates only after office confirms payment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;