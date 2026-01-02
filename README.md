# 🚌 Smart Bus Pass Management System with Real-Time GPS Tracking

A full-stack web application developed as a **final-year B.Tech Computer Science project** that digitizes bus pass management and provides **real-time bus tracking using mobile GPS**.

---

## 📌 Project Overview

The **Smart Bus Pass Management System** automates the entire bus pass lifecycle:
- Online application
- Admin approval
- Payment handling
- QR-based pass generation
- **Live bus tracking using conductor’s mobile GPS**

The system supports **three roles**:
- 👩‍🎓 Student
- 🧑‍💼 Admin
- 🧑‍✈️ Conductor

---

## 🎯 Objectives

- Replace manual bus pass systems with a digital solution
- Reduce paperwork and processing time
- Provide secure role-based authentication
- Enable **real-time GPS-based bus tracking**
- Improve transparency and efficiency in public transport systems

---

## 🚀 Live Deployment Links

### 🌐 Frontend (Vercel)
🔗 **Live App:**  
👉 https://YOUR-VERCEL-FRONTEND-URL.vercel.app

---

### ⚙️ Backend API (Render)
🔗 **API Base URL:**  
👉 https://smart-bus-pass-system.onrender.com

Test Endpoint:  
👉 https://smart-bus-pass-system.onrender.com/

---

### 🗄️ Database (Railway – MySQL)
- Hosted on **Railway Cloud**
- Secure production database
- Schema managed via SQL migrations

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- Socket.IO (real-time tracking)
- JWT Authentication

### Database
- MySQL (Railway)

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → Railway

---

## 👥 User Roles & Features

### 👩‍🎓 Student
- Register & Login
- Apply for bus pass
- View application status
- Make online / cash payments
- View **live bus location**
- Chatbot support

### 🧑‍💼 Admin
- Secure admin login
- Approve / reject bus pass applications
- Manage payments
- View all users and passes

### 🧑‍✈️ Conductor
- Secure conductor login
- Send live GPS coordinates from mobile
- Enable real-time tracking for students

---

## 📡 Real-Time Bus Tracking (CORE FEATURE)

- Conductor’s mobile sends GPS data
- Backend receives and stores location
- Socket.IO broadcasts live updates
- Students see bus movement in real time

**Flow:**
Conductor Mobile GPS → Backend API → Socket.IO → Student Dashboard Map


---

## 🔐 Authentication & Security

- JWT-based authentication
- Role-based route protection
- Secure API access
- Tokens stored safely on client

---

## 📂 Project Structure



Bus Pass System/
│
├── FRONTEND/
│ ├── src/
│ │ ├── components/
│ │ ├── lib/api.js
│ │ └── pages/
│ └── build/
│
├── BACKEND/
│ ├── server.js
│ ├── routes/
│ ├── database_migration/
│ └── bus_pass_db.sql
│
└── README.md

---

## ⚙️ Environment Variables (Backend)

```env
DATABASE_URL=your_railway_mysql_url
JWT_SECRET=your_jwt_secret
NODE_ENV=production
FRONTEND_URL=https://YOUR-VERCEL-FRONTEND-URL.vercel.app

**Future Scope**
Advanced analytics dashboard

AI-based route optimization

Push notifications

Mobile application

Predictive bus arrival time

NFC / Smart card integration
📚 References

React Documentation

Node.js Documentation

MySQL Documentation

Socket.IO Docs

JWT Authentication Docs

Smart Transportation Research Papers

✅ Conclusion

This project successfully demonstrates a scalable, secure, and real-time smart transportation solution, suitable for colleges and public transport authorities.

👩‍💻 Developed By

Anaya
B.Tech Computer Science (Final Year)

⭐ If you like this project, don’t forget to star the repository!

