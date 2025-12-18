// src/components/ApplyPass.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from "../lib/api";


const ApplyPass = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const renewalData = location.state?.renewalData || null;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    routeId: renewalData?.route_id || '',
    selectedRoute: renewalData ? {
      route_id: renewalData.route_id,
      route_name: renewalData.route_name,
      start_point: renewalData.start_point,
      end_point: renewalData.end_point,
      fare: renewalData.fare,
      fare_6month: renewalData.fare_6month,
      fare_yearly: renewalData.fare_yearly,
      distance_km: renewalData.distance_km
    } : null,
    duration: renewalData?.duration || 'monthly',
    idCardFile: null,
    idCardPreview: null
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
  try {
    const { data } = await api.get("/api/routes");
    setRoutes(data);
  } catch (err) {
    setError("Failed to load routes");
  }
};


  const handleRouteSelect = (route) => {
    setFormData({
      ...formData,
      routeId: route.route_id,
      selectedRoute: route
    });
  };

  const handleDurationChange = (duration) => {
    setFormData({
      ...formData,
      duration: duration
    });
  };

  const getFareByDuration = (route) => {
    if (!route) return 0;
    switch(formData.duration) {
      case 'monthly': return route.fare;
      case '6month': return route.fare_6month || route.fare * 5.5;
      case 'yearly': return route.fare_yearly || route.fare * 10;
      default: return route.fare;
    }
  };

  const getDurationLabel = (duration) => {
    switch(duration) {
      case 'monthly': return '1 Month';
      case '6month': return '6 Months';
      case 'yearly': return '1 Year';
      default: return duration;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        idCardFile: file,
        idCardPreview: URL.createObjectURL(file)
      });
    }
  };

const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
        const { data } = await api.post("/api/passes/apply", {
  routeId: formData.routeId,
  duration: formData.duration,
  isRenewal: !!renewalData

});

setSuccess(true);


        // Show renewal message if applicable
        if (data.isRenewal) {
  alert(
    `🎉 Renewal application submitted! You get ${data.renewalDiscount}% discount!`
  );
}

        
        setTimeout(() => {
            navigate('/dashboard');
        }, 3000);
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Application failed. Please try again.';
        const errorDetails = err.response?.data?.details || '';
        const existingPass = err.response?.data?.existingPass;
        
        if (existingPass) {
            // Show detailed error for existing pass
            setError(
                `${errorMessage}\n\n` +
                `Pass Number: ${existingPass.passNumber}\n` +
                `Status: ${existingPass.status}\n` +
                `Expires: ${existingPass.expiryDate}\n\n` +
                `${errorDetails}`
            );
        } else {
            setError(errorMessage);
        }
    } finally {
        setLoading(false);
    }
};

  const nextStep = () => {
    if (currentStep === 1 && !formData.routeId) {
      setError('Please select a route');
      return;
    }
    setError('');
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 animate-gradient-xy"></div>
        
        <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center max-w-md z-10">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
            <span className="text-5xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            {renewalData ? 'Renewal Submitted!' : 'Application Submitted!'}
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            Your bus pass {renewalData ? 'renewal' : 'application'} has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>

        <style jsx>{`
          @keyframes gradient-xy {
            0%, 100% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
          }
          .animate-gradient-xy {
            background-size: 400% 400%;
            animation: gradient-xy 15s ease infinite;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
                >
                  <span className="text-2xl">←</span>
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {renewalData ? 'Renew Bus Pass' : 'Apply for Bus Pass'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {renewalData ? 'Extend your pass validity' : 'Complete the application in 3 easy steps'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-2 mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span className={currentStep >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>
                Select Route
              </span>
              <span className={currentStep >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>
                Upload Documents
              </span>
              <span className={currentStep >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>
                Review & Submit
              </span>
            </div>
          </div>

          {/* Renewal Badge */}
          {renewalData && (
            <div className="bg-orange-100 border-2 border-orange-400 rounded-xl p-4 mb-6 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔄</span>
                <div>
                  <p className="font-bold text-orange-800">Pass Renewal</p>
                  <p className="text-sm text-orange-700">
                    Renewing pass for: <strong>{renewalData.route_name}</strong>
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Previous duration: {getDurationLabel(renewalData.duration)} | Previous fare: ₹{renewalData.fare}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 animate-shake">
              {error}
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-gray-200">
            
            {/* STEP 1: Route Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <span className="text-6xl mb-4 block">🗺️</span>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Your Route & Duration</h2>
                  <p className="text-gray-600">Choose the bus route and pass duration</p>
                </div>

                {/* Duration Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Select Pass Duration</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => handleDurationChange('monthly')}
                      className={`p-4 rounded-xl border-2 transition ${
                        formData.duration === 'monthly'
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">📅</div>
                      <p className="font-bold text-gray-800">Monthly</p>
                      <p className="text-xs text-gray-600">1 Month Pass</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDurationChange('6month')}
                      className={`p-4 rounded-xl border-2 transition ${
                        formData.duration === '6month'
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">📆</div>
                      <p className="font-bold text-gray-800">6 Months</p>
                      <p className="text-xs text-green-600 font-semibold">Save 10%</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDurationChange('yearly')}
                      className={`p-4 rounded-xl border-2 transition ${
                        formData.duration === 'yearly'
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">🗓️</div>
                      <p className="font-bold text-gray-800">Yearly</p>
                      <p className="text-xs text-green-600 font-semibold">Save 20%</p>
                    </button>
                  </div>
                </div>

                {/* Route Selection */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Select Your Route</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {routes.map((route) => (
                      <div
                        key={route.route_id}
                        onClick={() => handleRouteSelect(route)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                          formData.routeId === route.route_id
                            ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{route.route_name}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {route.start_point} → {route.end_point}
                            </p>
                          </div>
                          {formData.routeId === route.route_id && (
                            <span className="text-2xl">✅</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                          <span className="text-sm text-gray-600">
                            Distance: {route.distance_km} km
                          </span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-600">
                              ₹{getFareByDuration(route)}
                            </span>
                            <p className="text-xs text-gray-500">{getDurationLabel(formData.duration)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Document Upload */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <span className="text-6xl mb-4 block">📄</span>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Documents</h2>
                  <p className="text-gray-600">Upload your student ID card or college ID</p>
                </div>

                <div className="max-w-xl mx-auto">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      {formData.idCardPreview ? (
                        <div>
                          <img
                            src={formData.idCardPreview}
                            alt="ID Preview"
                            className="max-h-64 mx-auto rounded-lg shadow-lg mb-4"
                          />
                          <p className="text-sm text-green-600 font-semibold">✓ File uploaded</p>
                          <p className="text-xs text-gray-500 mt-2">Click to change</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-6xl mb-4 block">📁</span>
                          <p className="text-gray-700 font-semibold mb-2">Click to upload ID card</p>
                          <p className="text-sm text-gray-500">PNG, JPG or PDF (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Note: For now, document upload is optional. You can skip this step.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: Review & Submit */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <span className="text-6xl mb-4 block">👀</span>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Review Application</h2>
                  <p className="text-gray-600">Please review your details before submitting</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span>👤</span> Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Full Name</p>
                        <p className="font-semibold">{user.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {formData.selectedRoute && (
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border border-green-200">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🚌</span> Selected Route & Duration
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-lg">{formData.selectedRoute.route_name}</p>
                        <p className="text-gray-600">
                          {formData.selectedRoute.start_point} → {formData.selectedRoute.end_point}
                        </p>
                        <div className="bg-white p-3 rounded-lg mt-3">
                          <p className="text-gray-600 text-xs">Duration:</p>
                          <p className="font-bold text-lg text-blue-600">{getDurationLabel(formData.duration)}</p>
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t border-green-200">
                          <span className="text-gray-600">Total Fare:</span>
                          <span className="text-3xl font-bold text-green-600">
                            ₹{getFareByDuration(formData.selectedRoute)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {renewalData && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <p className="text-sm text-gray-700">
                        <strong>🎉 Renewal Benefit:</strong> You may be eligible for a 5% renewal discount after admin approval!
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Your application will be reviewed by admin. You'll receive an email notification once approved. After approval, you can proceed with payment to activate your pass.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
                >
                  ← Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white font-semibold rounded-xl transform hover:scale-105 transition-all duration-300"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-lg text-white font-bold rounded-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? 'Submitting...' : renewalData ? '🔄 Submit Renewal ✓' : 'Submit Application ✓'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -50px) scale(1.1); }
          50% { transform: translate(-30px, 30px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default ApplyPass;