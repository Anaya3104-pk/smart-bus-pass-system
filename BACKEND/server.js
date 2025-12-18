// server.js - Main Backend Server File
// Smart Bus Pass Management System - COMPLETE VERSION

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const app = express();
const http = require('http');
const socketIO = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});


// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('📱 New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('📴 Client disconnected:', socket.id);
  });
});
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let db;

if (process.env.DATABASE_URL) {
  // ✅ Production (Render → Railway)
  db = mysql.createPool(process.env.DATABASE_URL);
  console.log('🌍 Using DATABASE_URL (production)');
} else {
  // ✅ Local development
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });
  console.log('💻 Using local DB config');
}

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL Database');
    connection.release();
  }
});

module.exports = db;

// JWT Middleware - Verify Token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// ===================================
// AUTHENTICATION ROUTES
// ===================================

app.get('/', (req, res) => {
    res.json({ message: '🚌 Bus Pass API is running!' });
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, phone, role, studentId, collegeName, course, year, address } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const userQuery = 'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)';
            db.query(userQuery, [email, hashedPassword, fullName, phone, role || 'student'], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error creating user', error: err });
                }

                const userId = result.insertId;

                if (role === 'student' || !role) {
                    const profileQuery = 'INSERT INTO student_profiles (user_id, student_id, college_name, course, year, address) VALUES (?, ?, ?, ?, ?, ?)';
                    db.query(profileQuery, [userId, studentId, collegeName, course, year, address], (err) => {
                        if (err) {
                            console.error('Error creating student profile:', err);
                        }
                    });
                }

                res.status(201).json({ 
                    message: 'User registered successfully',
                    userId: userId
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const user = results[0];
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user.user_id, role: user.role, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token: token,
                user: {
                    id: user.user_id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role,
                    phone: user.phone,
                    profilePic: user.profile_pic
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/auth/profile', verifyToken, (req, res) => {
    db.query('SELECT user_id, email, full_name, phone, role, profile_pic, created_at FROM users WHERE user_id = ?', 
        [req.userId], 
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const user = results[0];

            if (user.role === 'student') {
                db.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.userId], (err, profileResults) => {
                    if (err) {
                        return res.status(500).json({ message: 'Database error', error: err });
                    }
                    res.json({ ...user, studentProfile: profileResults[0] || null });
                });
            } else {
                res.json(user);
            }
        }
    );
});

// Forgot Password - Request Reset Token
app.post('/api/auth/forgot-password', (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        db.query('SELECT user_id, email FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error', error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No account found with this email' });
            }

            const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const resetExpiry = new Date(Date.now() + 3600000);
            const formattedExpiry = resetExpiry.toISOString().slice(0, 19).replace('T', ' ');

            const checkQuery = 'SHOW COLUMNS FROM users LIKE "reset_token"';
            db.query(checkQuery, (err, columnResults) => {
                if (err || columnResults.length === 0) {
                    console.warn('Reset token columns not found in database');
                    return res.json({
                        message: 'Password reset token generated (Database columns missing)',
                        resetToken: resetToken,
                        email: email,
                        note: 'Please add reset_token columns to users table'
                    });
                }

                const query = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
                db.query(query, [resetToken, formattedExpiry, email], (err, updateResult) => {
                    if (err) {
                        console.error('Error saving reset token:', err);
                        return res.status(500).json({ 
                            message: 'Error generating reset token', 
                            error: err.message 
                        });
                    }

                    res.json({
                        message: 'Password reset token generated successfully',
                        resetToken: resetToken,
                        email: email,
                        note: 'In production, this would be sent via email'
                    });
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Reset Password with Token
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const query = 'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()';
        db.query(query, [email, resetToken], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (results.length === 0) {
                return res.status(400).json({ message: 'Invalid or expired reset token' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updateQuery = 'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?';
            db.query(updateQuery, [hashedPassword, email], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error updating password', error: err });
                }

                res.json({ message: 'Password reset successfully! You can now login with your new password.' });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===================================
// ROUTES API
// ===================================

app.get('/api/routes', (req, res) => {
    db.query('SELECT * FROM routes WHERE active = TRUE', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(results);
    });
});

// ===================================
// BUS PASS ROUTES
// ===================================

app.post('/api/passes/apply', verifyToken, (req, res) => {
    const { routeId, duration, isRenewal } = req.body;
    
    if (!routeId) {
        return res.status(400).json({ message: 'Route ID is required' });
    }

    // Check if user already has an active pass
    const checkActivePassQuery = 'SELECT bp.*, r.route_name FROM bus_passes bp LEFT JOIN routes r ON bp.route_id = r.route_id WHERE bp.user_id = ? AND bp.status IN ("pending", "approved") AND (bp.expiry_date IS NULL OR bp.expiry_date >= NOW()) ORDER BY bp.created_at DESC LIMIT 1';
    
    db.query(checkActivePassQuery, [req.userId], (err, activePasses) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (activePasses && activePasses.length > 0) {
            const existingPass = activePasses[0];
            const expiryDate = existingPass.expiry_date ? new Date(existingPass.expiry_date).toLocaleDateString() : 'N/A';
            
            return res.status(400).json({ 
                message: 'You already have an active pass!',
                details: 'You cannot apply for a new pass until your current pass expires.',
                existingPass: {
                    passNumber: existingPass.pass_number,
                    status: existingPass.status,
                    expiryDate: expiryDate,
                    routeName: existingPass.route_name || 'Current Pass'
                }
            });
        }

        // Check if user has expired pass for renewal
        const checkExpiredQuery = 'SELECT * FROM bus_passes WHERE user_id = ? AND status = "approved" AND expiry_date < NOW() ORDER BY created_at DESC LIMIT 1';
        
        db.query(checkExpiredQuery, [req.userId], (err, expiredPasses) => {
            if (err) {
                console.error('Error checking expired passes:', err);
            }

            const hasExpiredPass = expiredPasses && expiredPasses.length > 0;
            const isActualRenewal = isRenewal && hasExpiredPass;

            const passNumber = 'BP' + Date.now();
            const qrCodeData = passNumber;
            const passDuration = duration || 'monthly';
            
            const query = 'INSERT INTO bus_passes (user_id, route_id, duration, pass_number, qr_code, status, payment_status, is_renewal) VALUES (?, ?, ?, ?, ?, "pending", "pending", ?)';
            
            db.query(query, [req.userId, routeId, passDuration, passNumber, qrCodeData, isActualRenewal ? 1 : 0], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error creating pass application', error: err });
                }
                
                res.status(201).json({
                    message: 'Pass application submitted successfully',
                    passId: result.insertId,
                    passNumber: passNumber,
                    status: 'pending',
                    isRenewal: isActualRenewal,
                    renewalDiscount: isActualRenewal ? 5 : 0
                });
            });
        });
    });
});

app.get('/api/passes/my-passes', verifyToken, (req, res) => {
    const query = 'SELECT bp.*, r.route_name, r.start_point, r.end_point, r.fare, r.fare_6month, r.fare_yearly FROM bus_passes bp JOIN routes r ON bp.route_id = r.route_id WHERE bp.user_id = ? ORDER BY bp.created_at DESC';
    
    db.query(query, [req.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(results);
    });
});

// ===================================
// ADMIN ROUTES
// ===================================

app.get('/api/admin/passes/pending', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const query = 'SELECT bp.*, u.full_name, u.email, u.phone, r.route_name, r.fare, r.fare_6month, r.fare_yearly, r.start_point, r.end_point FROM bus_passes bp JOIN users u ON bp.user_id = u.user_id JOIN routes r ON bp.route_id = r.route_id WHERE bp.status = "pending" ORDER BY bp.created_at DESC';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(results);
    });
});

app.put('/api/admin/passes/:passId/approve', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { passId } = req.params;
    
    const getPassQuery = 'SELECT bp.*, r.fare, r.fare_6month, r.fare_yearly FROM bus_passes bp JOIN routes r ON bp.route_id = r.route_id WHERE bp.pass_id = ?';
    
    db.query(getPassQuery, [passId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Pass not found' });
        }

        const passData = results[0];
        const duration = passData.duration;
        const isRenewal = passData.is_renewal;
        const issueDate = new Date();
        const expiryDate = new Date();
        
        switch(duration) {
            case 'monthly':
                expiryDate.setMonth(expiryDate.getMonth() + 1);
                break;
            case '6month':
                expiryDate.setMonth(expiryDate.getMonth() + 6);
                break;
            case 'yearly':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                break;
            default:
                expiryDate.setMonth(expiryDate.getMonth() + 1);
        }

        let baseFare = passData.fare;
        if (duration === '6month') {
            baseFare = passData.fare_6month || passData.fare * 5.5;
        } else if (duration === 'yearly') {
            baseFare = passData.fare_yearly || passData.fare * 10;
        }

        const renewalDiscount = isRenewal ? 5 : 0;
        const finalFare = isRenewal ? (baseFare * 0.95).toFixed(2) : baseFare;

        const query = 'UPDATE bus_passes SET status = "approved", issue_date = ?, expiry_date = ?, renewal_discount = ?, payment_status = "pending", updated_at = CURRENT_TIMESTAMP WHERE pass_id = ?';

        db.query(query, [issueDate, expiryDate, renewalDiscount, passId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error approving pass', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Pass not found' });
            }

            res.json({
                message: 'Pass approved successfully',
                issueDate: issueDate,
                expiryDate: expiryDate,
                isRenewal: isRenewal,
                renewalDiscount: renewalDiscount,
                finalFare: finalFare
            });
        });
    });
});

app.put('/api/admin/passes/:passId/reject', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { passId } = req.params;

    const query = 'UPDATE bus_passes SET status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE pass_id = ?';

    db.query(query, [passId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error rejecting pass', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pass not found' });
        }

        res.json({ message: 'Pass rejected' });
    });
});

// ===================================
// PAYMENT ROUTES
// ===================================

app.post('/api/payments/test-payment', verifyToken, (req, res) => {
    const { passId } = req.body;
    
    if (!passId) {
        return res.status(400).json({ message: 'Pass ID is required' });
    }

    const getPassQuery = 'SELECT bp.*, r.fare, r.fare_6month, r.fare_yearly FROM bus_passes bp JOIN routes r ON bp.route_id = r.route_id WHERE bp.pass_id = ?';
    
    db.query(getPassQuery, [passId], (err, passResults) => {
        if (err || passResults.length === 0) {
            return res.status(404).json({ message: 'Pass not found' });
        }

        const passData = passResults[0];
        
        let baseFare = passData.fare;
        if (passData.duration === '6month') {
            baseFare = passData.fare_6month || passData.fare * 5.5;
        } else if (passData.duration === 'yearly') {
            baseFare = passData.fare_yearly || passData.fare * 10;
        }

        const finalAmount = passData.is_renewal ? (baseFare * 0.95).toFixed(2) : baseFare;

        const transactionId = 'TXN' + Date.now();
        const paymentDate = new Date();

        const paymentQuery = 'INSERT INTO payments (pass_id, user_id, amount, payment_method, transaction_id, status, payment_date) VALUES (?, ?, ?, "online_test", ?, "success", ?)';

        db.query(paymentQuery, [passId, req.userId, finalAmount, transactionId, paymentDate], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Payment error', error: err });
            }

            const updatePassQuery = 'UPDATE bus_passes SET payment_status = "success", updated_at = CURRENT_TIMESTAMP WHERE pass_id = ?';

            db.query(updatePassQuery, [passId], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error updating pass', error: err });
                }

                res.json({
                    success: true,
                    message: 'Payment successful',
                    transactionId: transactionId,
                    paymentId: result.insertId,
                    amountPaid: finalAmount,
                    renewalDiscount: passData.renewal_discount || 0,
                    savedAmount: passData.is_renewal ? (baseFare - finalAmount).toFixed(2) : 0
                });
            });
        });
    });
});

app.post('/api/payments/cash-payment', verifyToken, (req, res) => {
    const { passId } = req.body;
    
    if (!passId) {
        return res.status(400).json({ message: 'Pass ID is required' });
    }

    const getPassQuery = 'SELECT bp.*, r.fare, r.fare_6month, r.fare_yearly FROM bus_passes bp JOIN routes r ON bp.route_id = r.route_id WHERE bp.pass_id = ?';
    
    db.query(getPassQuery, [passId], (err, passResults) => {
        if (err || passResults.length === 0) {
            return res.status(404).json({ message: 'Pass not found' });
        }

        const passData = passResults[0];
        
        let baseFare = passData.fare;
        if (passData.duration === '6month') {
            baseFare = passData.fare_6month || passData.fare * 5.5;
        } else if (passData.duration === 'yearly') {
            baseFare = passData.fare_yearly || passData.fare * 10;
        }

        const finalAmount = passData.is_renewal ? (baseFare * 0.95).toFixed(2) : baseFare;

        const referenceNumber = 'CASH' + Date.now();
        const paymentDate = new Date();

        const paymentQuery = 'INSERT INTO payments (pass_id, user_id, amount, payment_method, transaction_id, status, payment_date) VALUES (?, ?, ?, "cash", ?, "pending", ?)';

        db.query(paymentQuery, [passId, req.userId, finalAmount, referenceNumber, paymentDate], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Payment error', error: err });
            }

            const updatePassQuery = 'UPDATE bus_passes SET payment_status = "cash_pending", payment_reference = ?, updated_at = CURRENT_TIMESTAMP WHERE pass_id = ?';

            db.query(updatePassQuery, [referenceNumber, passId], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error updating pass', error: err });
                }

                res.json({
                    success: true,
                    message: 'Cash payment slip generated',
                    referenceNumber: referenceNumber,
                    paymentId: result.insertId,
                    amountToPay: finalAmount,
                    renewalDiscount: passData.renewal_discount || 0,
                    savedAmount: passData.is_renewal ? (baseFare - finalAmount).toFixed(2) : 0
                });
            });
        });
    });
});

app.get('/api/admin/payments/cash-pending', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const query = 'SELECT p.*, bp.pass_number, bp.pass_id, bp.payment_reference, u.full_name, u.email, u.phone, r.route_name FROM payments p JOIN bus_passes bp ON p.pass_id = bp.pass_id JOIN users u ON p.user_id = u.user_id JOIN routes r ON bp.route_id = r.route_id WHERE p.payment_method = "cash" AND p.status = "pending" ORDER BY p.payment_date DESC';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(results);
    });
});

app.put('/api/admin/payments/:paymentId/confirm-cash', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { paymentId } = req.params;

    db.query('SELECT pass_id FROM payments WHERE payment_id = ?', [paymentId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const passId = results[0].pass_id;

        const updatePaymentQuery = 'UPDATE payments SET status = "success" WHERE payment_id = ?';

        db.query(updatePaymentQuery, [paymentId], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating payment', error: err });
            }

            const updatePassQuery = 'UPDATE bus_passes SET payment_status = "success", updated_at = CURRENT_TIMESTAMP WHERE pass_id = ?';

            db.query(updatePassQuery, [passId], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error activating pass', error: err });
                }

                res.json({
                    success: true,
                    message: 'Cash payment confirmed. Pass activated!'
                });
            });
        });
    });
});

app.get('/api/payments/my-payments', verifyToken, (req, res) => {
    const query = 'SELECT p.*, bp.pass_number, r.route_name FROM payments p JOIN bus_passes bp ON p.pass_id = bp.pass_id JOIN routes r ON bp.route_id = r.route_id WHERE p.user_id = ? ORDER BY p.payment_date DESC';

    db.query(query, [req.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(results);
    });
});

// ===================================
// CHATBOT ROUTES
// ===================================

app.post('/api/chatbot/query', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const userMessage = message.toLowerCase();

        const passQuery = 'SELECT bp.*, r.route_name, r.start_point, r.end_point, r.fare, r.fare_6month, r.fare_yearly FROM bus_passes bp JOIN routes r ON bp.route_id = r.route_id WHERE bp.user_id = ? ORDER BY bp.created_at DESC LIMIT 1';
        
        const passInfo = await new Promise((resolve, reject) => {
            db.query(passQuery, [req.userId], (err, results) => {
                if (err) reject(err);
                resolve(results[0] || null);
            });
        });

        const routesQuery = 'SELECT * FROM routes WHERE active = TRUE';
        const allRoutes = await new Promise((resolve, reject) => {
            db.query(routesQuery, (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        let aiResponse = '';

        if (userMessage.includes('pass status') || userMessage.includes('my pass') || userMessage.includes('status')) {
            if (passInfo) {
                const statusEmoji = {
                    'pending': '⏳',
                    'approved': '✅',
                    'rejected': '❌',
                    'expired': '⏰'
                };
                
                const paymentEmoji = {
                    'pending': '⏳',
                    'success': '✅',
                    'cash_pending': '💵',
                    'failed': '❌'
                };

                aiResponse = 'Your Pass Status: ' + statusEmoji[passInfo.status] + ' **' + passInfo.status.toUpperCase() + '**\n\n';
                aiResponse += '📋 **Pass Details:**\n';
                aiResponse += '• Pass Number: ' + passInfo.pass_number + '\n';
                aiResponse += '• Route: ' + passInfo.route_name + '\n';
                aiResponse += '• From: ' + passInfo.start_point + '\n';
                aiResponse += '• To: ' + passInfo.end_point + '\n';
                aiResponse += '• Duration: ' + passInfo.duration + '\n';
                
                let fare = passInfo.fare;
                if (passInfo.duration === '6month') {
                    fare = passInfo.fare_6month || passInfo.fare * 5.5;
                } else if (passInfo.duration === 'yearly') {
                    fare = passInfo.fare_yearly || passInfo.fare * 10;
                }
                
                if (passInfo.is_renewal && passInfo.renewal_discount > 0) {
                    aiResponse += '• Original Fare: ₹' + fare + '\n';
                    aiResponse += '• Renewal Discount: ' + passInfo.renewal_discount + '%\n';
                    aiResponse += '• Final Fare:🎉 ₹' + (fare * 0.95).toFixed(2) + '\n';
} else {
aiResponse += '• Fare: ₹' + fare + '\n';
}aiResponse += '\n💳 **Payment Status:** ' + paymentEmoji[passInfo.payment_status] + ' ' + passInfo.payment_status + '\n';
            
            if (passInfo.issue_date) {
                aiResponse += '\n📅 **Validity:**\n';
                aiResponse += '• Issued: ' + new Date(passInfo.issue_date).toLocaleDateString() + '\n';
            }
            
            if (passInfo.expiry_date) {
                const expiryDate = new Date(passInfo.expiry_date);
                const today = new Date();
                const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                aiResponse += '• Expires: ' + expiryDate.toLocaleDateString() + '\n';
                
                if (daysLeft > 0) {
                    aiResponse += '• Days Remaining: ' + daysLeft + ' days ⏰\n';
                } else {
                    aiResponse += '• ⚠️ Pass has expired!\n';
                }
            }

            if (passInfo.status === 'approved' && passInfo.payment_status === 'pending') {
                aiResponse += '\n💡 **Next Step:** Complete payment to activate your pass!';
            } else if (passInfo.status === 'approved' && passInfo.payment_status === 'cash_pending') {
                aiResponse += '\n💡 **Next Step:** Visit college office with reference number ' + passInfo.payment_reference + ' to complete cash payment.';
            } else if (passInfo.status === 'pending') {
                aiResponse += '\n💡 Your application is under review by admin. You\'ll be notified once approved!';
            }
        } else {
            aiResponse = 'You don\'t have an active pass yet! 😊\n\n';
            aiResponse += '📝 **To apply for a pass:**\n';
            aiResponse += '1. Go to Dashboard\n';
            aiResponse += '2. Click "Apply for Pass" button\n';
            aiResponse += '3. Choose your preferred route\n';
            aiResponse += '4. Select duration (Monthly/6-Month/Yearly)\n';
            aiResponse += '5. Submit application\n';
            aiResponse += '6. Wait for admin approval\n';
            aiResponse += '7. Complete payment\n\n';
            aiResponse += 'Need help choosing a route? Ask me "Show me all routes"';
        }
    }
    else if (userMessage.includes('route') || userMessage.includes('bus') || userMessage.includes('fare') || userMessage.includes('price')) {
        let specificRoute = null;
        if (userMessage.includes('route 1')) specificRoute = allRoutes.find(r => r.route_name.includes('Route 1'));
        else if (userMessage.includes('route 2')) specificRoute = allRoutes.find(r => r.route_name.includes('Route 2'));
        else if (userMessage.includes('route 3')) specificRoute = allRoutes.find(r => r.route_name.includes('Route 3'));

        if (specificRoute) {
            aiResponse = '🚌 **' + specificRoute.route_name + '**\n\n';
            aiResponse += '📍 **Journey:**\n';
            aiResponse += '• From: ' + specificRoute.start_point + '\n';
            aiResponse += '• To: ' + specificRoute.end_point + '\n';
            aiResponse += '• Distance: ' + specificRoute.distance_km + ' km\n\n';
            aiResponse += '💰 **Fare Options:**\n';
            aiResponse += '• Monthly: ₹' + specificRoute.fare + '\n';
            aiResponse += '• 6-Month: ₹' + (specificRoute.fare_6month || specificRoute.fare * 5.5) + ' (Save 10%)\n';
            aiResponse += '• Yearly: ₹' + (specificRoute.fare_yearly || specificRoute.fare * 10) + ' (Save 20%)\n\n';
            aiResponse += '✅ Ready to apply? Go to Dashboard → Apply for Pass';
        } else {
            aiResponse = '🚌 **Available Bus Routes:**\n\n';
            allRoutes.forEach((route, index) => {
                aiResponse += '**' + route.route_name + '**\n';
                aiResponse += '📍 ' + route.start_point + ' → ' + route.end_point + '\n';
                aiResponse += '📏 Distance: ' + route.distance_km + ' km\n';
                aiResponse += '💰 Fares:\n';
                aiResponse += '   • Monthly: ₹' + route.fare + '\n';
                aiResponse += '   • 6-Month: ₹' + (route.fare_6month || route.fare * 5.5) + '\n';
                aiResponse += '   • Yearly: ₹' + (route.fare_yearly || route.fare * 10) + '\n';
                if (index < allRoutes.length - 1) aiResponse += '\n';
            });
            aiResponse += '\n💡 Ask me about a specific route: "What is Route 1 fare?"';
        }
    }
    else if (userMessage.includes('renew') || userMessage.includes('renewal') || userMessage.includes('extend')) {
        aiResponse = '🔄 **Pass Renewal Process:**\n\n';
        
        if (passInfo && passInfo.expiry_date) {
            const expiryDate = new Date(passInfo.expiry_date);
            const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            
            if (daysLeft > 7) {
                aiResponse += 'Your current pass expires on ' + expiryDate.toLocaleDateString() + ' (' + daysLeft + ' days left).\n\n';
                aiResponse += '💡 **Renewal Tips:**\n';
                aiResponse += '• Apply 7 days before expiry\n';
                aiResponse += '• Choose same or different route\n';
                aiResponse += '• Consider longer duration for savings\n';
                aiResponse += '• Get 5% renewal discount! 🎉\n\n';
            } else if (daysLeft > 0) {
                aiResponse += '⚠️ Your pass expires soon (' + daysLeft + ' days left)!\n\n';
                aiResponse += '🚨 **Act Now:**\n';
                aiResponse += 'Apply for renewal immediately to avoid service gaps.\n\n';
            } else {
                aiResponse += '❌ Your pass has expired!\n\n';
            }
        }
        
        aiResponse += '📝 **How to Renew:**\n';
        aiResponse += '1. Wait until pass expires (or 7 days before)\n';
        aiResponse += '2. Go to Dashboard → "Renew Pass"\n';
        aiResponse += '3. Your previous route will be pre-selected\n';
        aiResponse += '4. Submit application\n';
        aiResponse += '5. Admin approves quickly\n';
        aiResponse += '6. Complete payment with 5% discount! 🎉\n\n';
        aiResponse += '💰 **Save Even More:** Combine renewal discount with long-term plans!';
    }
    else if (userMessage.includes('payment') || userMessage.includes('pay') || userMessage.includes('cash') || userMessage.includes('online')) {
        aiResponse = '💳 **Payment Methods:**\n\n';
        aiResponse += '**1. Online Payment** 🌐\n';
        aiResponse += '✅ Instant activation\n';
        aiResponse += '✅ UPI, Credit/Debit Cards, Net Banking\n';
        aiResponse += '✅ Secure & Fast\n';
        aiResponse += '✅ Get QR code immediately\n\n';
        
        aiResponse += '**2. Cash Payment** 💵\n';
        aiResponse += '✅ Pay at college office\n';
        aiResponse += '✅ Generate payment slip first\n';
        aiResponse += '✅ Office hours: 9 AM - 5 PM\n';
        aiResponse += '✅ Admin confirms & activates pass\n\n';
        
        if (passInfo && passInfo.status === 'approved' && passInfo.payment_status === 'pending') {
            aiResponse += '💡 **Your pass is approved!** Go to "My Passes" to complete payment now.';
        } else if (passInfo && passInfo.payment_status === 'cash_pending') {
            aiResponse += '📌 **Your Reference:** ' + passInfo.payment_reference + '\n';
            aiResponse += 'Visit office with this number to complete payment.';
        }
    }
    else if (userMessage.includes('help') || userMessage.includes('what can you') || userMessage.includes('menu')) {
        aiResponse = '👋 **Hi! I\'m your Bus Pass Assistant**\n\n';
        aiResponse += '💬 **I can help you with:**\n\n';
        aiResponse += '📊 Check your pass status\n';
        aiResponse += '🚌 View all routes & fares\n';
        aiResponse += '🔄 Renewal information (with 5% discount!)\n';
        aiResponse += '💳 Payment options (Online/Cash)\n';
        aiResponse += '📝 Application process\n';
        aiResponse += '❓ General queries\n\n';
        aiResponse += '**Try asking:**\n';
        aiResponse += '• "What is my pass status?"\n';
        aiResponse += '• "Show me all routes"\n';
        aiResponse += '• "How do I renew my pass?"\n';
        aiResponse += '• "What is Route 1 fare?"\n';
        aiResponse += '• "Payment options"\n\n';
        aiResponse += 'What would you like to know? 😊';
    }
    else {
        aiResponse = 'I\'m here to help! 😊\n\n';
        aiResponse += 'I didn\'t quite understand your question, but here\'s what I can do:\n\n';
        aiResponse += '✅ Check pass status & validity\n';
        aiResponse += '✅ Show routes & fares\n';
        aiResponse += '✅ Explain renewal process (5% discount!)\n';
        aiResponse += '✅ Payment information\n';
        aiResponse += '✅ Application help\n\n';
        aiResponse += '**Quick Questions:**\n';
        aiResponse += '• "What is my pass status?"\n';
        aiResponse += '• "Show all routes"\n';
        aiResponse += '• "How to renew?"\n';
        aiResponse += '• "Payment options"\n\n';
        aiResponse += 'What would you like to know?';
    }

    const logQuery = 'INSERT INTO chatbot_logs (user_id, query, response) VALUES (?, ?, ?)';
    db.query(logQuery, [req.userId, message, aiResponse], (err) => {
        if (err) console.error('Error saving chat log:', err);
    });

    res.json({
        success: true,
        message: aiResponse,
        timestamp: new Date()
    });

} catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
        message: 'Sorry, I encountered an error. Please try again later. 😔',
        error: error.message 
    });
}});
app.get('/api/chatbot/history', verifyToken, (req, res) => {
const query = 'SELECT query, response, timestamp FROM chatbot_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20';});
app.get('/api/chatbot/history', verifyToken, (req, res) => {
const query = 'SELECT query, response, timestamp FROM chatbot_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20';});
app.delete('/api/chatbot/history', verifyToken, (req, res) => {
const query = 'DELETE FROM chatbot_logs WHERE user_id = ?';db.query(query, [req.userId], (err, result) => {
    if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
    }
    res.json({ 
        success: true,
        message: 'Chat history cleared',
        deletedCount: result.affectedRows
    });
});});
// =====================================================
// BUS TRACKING ROUTES
// =====================================================

// Update bus location (Conductor sends GPS from phone)
app.post('/api/bus/update-location', verifyToken, async (req, res) => {
  try {
    const { busId, latitude, longitude, speed } = req.body;
    
    // Validate input
    if (!busId || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false,
        message: 'Bus ID, latitude, and longitude are required' 
      });
    }

    // Update bus current location in database
    const updateQuery = `
      UPDATE buses 
      SET current_lat = ?, 
          current_lng = ?, 
          last_updated = NOW(),
          is_tracking = TRUE
      WHERE bus_id = ?
    `;
    
    db.query(updateQuery, [latitude, longitude, busId], (err, result) => {
      if (err) {
        console.error('Error updating bus location:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Error updating location',
          error: err.message 
        });
      }

      // Log location history for analytics
      const logQuery = `
        INSERT INTO bus_locations (bus_id, latitude, longitude, speed) 
        VALUES (?, ?, ?, ?)
      `;
      
      db.query(logQuery, [busId, latitude, longitude, speed || 0], (err) => {
        if (err) {
          console.error('Error logging location:', err);
        }
      });

      // Broadcast location to all connected clients via Socket.IO
      io.emit(`bus:location:${busId}`, {
        busId,
        latitude,
        longitude,
        speed: speed || 0,
        timestamp: new Date()
      });

      // Also broadcast to general channel
      io.emit('bus:location:update', {
        busId,
        latitude,
        longitude,
        speed: speed || 0,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Location updated successfully',
        data: {
          busId,
          latitude,
          longitude,
          timestamp: new Date()
        }
      });
    });
  } catch (error) {
    console.error('Bus location update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get all active bus locations (For student map)
app.get('/api/bus/live', (req, res) => {
  try {
    const { routeId } = req.query;
    
    let query = `
      SELECT 
        b.bus_id,
        b.bus_number,
        b.route_id,
        b.current_lat,
        b.current_lng,
        b.last_updated,
        b.status,
        b.is_tracking,
        r.route_name,
        r.start_point,
        r.end_point
      FROM buses b
      LEFT JOIN routes r ON b.route_id = r.route_id
      WHERE b.status = 'active' 
        AND b.is_tracking = TRUE
        AND b.current_lat IS NOT NULL
        AND b.current_lng IS NOT NULL
    `;
    
    const params = [];
    
    // Filter by route if specified
    if (routeId) {
      query += ' AND b.route_id = ?';
      params.push(routeId);
    }
    
    query += ' ORDER BY b.last_updated DESC';
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching live buses:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Error fetching bus locations',
          error: err.message 
        });
      }

      res.json({
        success: true,
        buses: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error('Error in live bus endpoint:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get bus location history (For analytics)
app.get('/api/bus/:busId/history', verifyToken, (req, res) => {
  try {
    const { busId } = req.params;
    const { hours } = req.query; // How many hours back to fetch
    
    const hoursBack = hours || 24; // Default 24 hours
    
    const query = `
      SELECT 
        location_id,
        bus_id,
        latitude,
        longitude,
        speed,
        timestamp
      FROM bus_locations
      WHERE bus_id = ?
        AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY timestamp DESC
      LIMIT 100
    `;
    
    db.query(query, [busId, hoursBack], (err, results) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          message: 'Error fetching history',
          error: err.message 
        });
      }

      res.json({
        success: true,
        history: results,
        busId: busId,
        count: results.length
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});
// ===================================
// START SERVER
// ===================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('🚀 Server is running on http://localhost:' + PORT);
  console.log('📊 Environment: ' + (process.env.NODE_ENV || 'development'));
  console.log('🤖 Chatbot: Enabled ✅');
  console.log('📡 Socket.IO: Enabled ✅');
  console.log('🗺️  Real-time Tracking: Active ✅');
});