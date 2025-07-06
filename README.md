# 📹 Smart CCTV Camera Monitoring System

A real-time camera monitoring and alerting solution designed for high-security areas like power plants. This dashboard ensures all CCTV feeds are constantly monitored, with automatic alerts via **SMS and email** when any camera goes offline. The system supports **real-time updates**, **manual alert resolution**, and **MySQL-based logging**.

---

## 🚨 Problem Statement

In large-scale environments like **power plants**, it's difficult for operators to notice when a camera goes offline. This downtime could lead to blind spots and safety threats. Manual monitoring is inefficient and error-prone.

✅ **This system solves that** by automatically detecting offline cameras and notifying the concerned team instantly.

---

## 🎯 Key Features

| Feature                      | Description                                                   |
|-----------------------------|---------------------------------------------------------------|
| 🧭 Dashboard Overview       | Shows total, online, offline cameras & active alerts         |
| 📺 Live Camera Feeds        | Live view of up to 4 IP cameras in real-time                  |
| 📶 Ping-Based Health Check  | Checks camera availability every 3 seconds                   |
| 📬 Email Alerts             | Sends email notifications when cameras go offline            |
| 📱 SMS Alerts               | Sends SMS notifications via Twilio                           |
| 📝 Alert Resolution         | Add manual remarks to resolve offline alerts                 |
| 💾 MySQL Database Logging   | Saves camera info, alert logs, remarks                        |
| 🌐 Real-Time Updates        | Uses WebSocket (Socket.IO) for frontend sync                 |

---

## 📦 Technologies Used

### 👨‍💻 Languages & Libraries
- **JavaScript**, **TypeScript**
- **Node.js**, **Express.js**
- **React.js** (Vite + Hooks)
- **Tailwind CSS**

### 🔗 Backend & Realtime
- **Socket.IO** – real-time camera status updates
- **Nodemailer** – Email notifications via Gmail
- **Twilio API** – SMS notifications
- **MySQL** – Camera and alert storage
- **dotenv** – Secure env config

### 📱 Camera Feed
- **IP Webcam Android App** – Used for live feed streaming via IP address

### Start Frontend

npm install
npm run dev
Visit: http://localhost:5173


### 📻 Camera Setup (Using IP Webcam App)

1) Install IP Webcam on Android
2) Start server in app
3) Use displayed IP like http://xxx.xxx.1.100:8080
4) Input full IP in Add Camera Modal on dashboard

### 🚀 Future Scope

🔐 Authentication for dashboard access
📊 Alert analytics & visualization
🧠 Blur/Smoke/Fire detection using OpenCV + AI
☁️ Cloud deployment on Railway / Render

