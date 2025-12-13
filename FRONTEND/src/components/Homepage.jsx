// src/components/Homepage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBus, 
  FaMobileAlt, 
  FaQrcode, 
  FaMapMarkedAlt, 
  FaClock, 
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaUserGraduate,
  FaChartLine
} from 'react-icons/fa';

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-primary-700 w-10 h-10 rounded-lg flex items-center justify-center">
                <FaBus className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Smart Bus Pass</h1>
                <p className="text-xs text-gray-500">Digital Transit Solution</p>
              </div>
            </div>

            {/* Nav Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-primary-700 font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-primary-700 hover:bg-primary-800 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Your Digital Bus Pass,
                <span className="block text-blue-200">Anytime, Anywhere</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Say goodbye to paper passes. Get instant access to your bus pass on your phone with QR code verification.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-white text-primary-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Apply Now
                  <FaArrowRight />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary-700 transition-all duration-200"
                >
                  Login
                </button>
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary-700 w-12 h-12 rounded-full flex items-center justify-center">
                      <FaUserGraduate className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Student Pass</p>
                      <p className="text-sm text-gray-600">Active</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 h-48 rounded-xl flex items-center justify-center mb-4">
                    <FaQrcode className="text-gray-400 text-8xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Pass ID</p>
                      <p className="font-bold text-gray-800">BP2024001</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Valid Until</p>
                      <p className="font-bold text-gray-800">Dec 31, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Smart Bus Pass?</h2>
            <p className="text-xl text-gray-600">Everything you need for hassle-free bus travel</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaMobileAlt className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">100% Digital</h3>
              <p className="text-gray-600">
                No more paper passes. Your bus pass is always on your phone, accessible anytime.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaQrcode className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">QR Verification</h3>
              <p className="text-gray-600">
                Quick and secure QR code scanning for instant verification by conductors.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaMapMarkedAlt className="text-purple-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Live Tracking</h3>
              <p className="text-gray-600">
                Track your bus in real-time and never miss your ride again.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaClock className="text-orange-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Approval</h3>
              <p className="text-gray-600">
                Apply online and get approved within 24 hours. Fast and efficient.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaShieldAlt className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Safe</h3>
              <p className="text-gray-600">
                Your data is encrypted and secure. We prioritize your privacy and safety.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaChartLine className="text-indigo-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Analytics</h3>
              <p className="text-gray-600">
                Track your travel history and manage your passes with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get your digital bus pass in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-primary-700 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign Up</h3>
              <p className="text-gray-600">
                Create your account with basic details and student information.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-primary-700 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Apply for Pass</h3>
              <p className="text-gray-600">
                Select your route, choose duration, and submit your application.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-primary-700 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Your Pass</h3>
              <p className="text-gray-600">
                Once approved, pay online and get instant access to your digital pass.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Go Digital?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students already using Smart Bus Pass
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white text-primary-700 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            Get Started Now
            <FaArrowRight />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary-700 w-8 h-8 rounded-lg flex items-center justify-center">
                  <FaBus className="text-white" />
                </div>
                <h3 className="font-bold text-lg">Smart Bus Pass</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Making bus travel easier and more accessible for students.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition">Login</button></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-white transition">Sign Up</button></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: support@smartbuspass.com</li>
                <li>Phone: +91 9876543210</li>
                <li>Address: College Campus, City</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Smart Bus Pass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;