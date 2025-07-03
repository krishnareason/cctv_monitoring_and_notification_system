📹 Smart CCTV Camera Monitoring System


A powerful real-time CCTV monitoring dashboard designed for critical infrastructure like power plants, where dozens of cameras must be constantly supervised. This project provides a centralized dashboard, real-time status updates, and automated email/SMS alerts when any camera goes offline.


📈 Problem Statement

In environments such as power plants, cameras are deployed to monitor sensitive zones. However, when one goes offline, it's hard for the monitoring team to immediately detect it. Delayed response to such outages can be dangerous.


✅ Key Features
Feature                                  Description

📅 Dashboard Overview                    View total, online, offline cameras & active alerts

📻 Live Camera Feed                      Displays real-time IP Webcam streams (up to 4 cameras)

🚨 Offline Alert Detection               Monitors each camera's health every 3 seconds

📢 Email + SMS Notifications             Sends alerts when camera goes offline (via Gmail + Twilio)

🖋️ Alert Resolution                      Resolve alerts with manual remark input

📊 Database Logging                      Stores camera info, status, alerts, and remarks in MySQL

🌐 WebSocket Real-Time Sync              Uses Socket.IO for instant status updates on frontend


🛋‍♂️ User Flow

1) User adds camera (via IP address and custom name).
2) System pings cameras every 3 seconds.
3) If a camera is offline:
   > Marks status as offline
   > Logs alert in MySQL
   > Triggers Email + SMS notification
   > Displays alert on dashboard
4) Monitoring user can resolve alert by entering a remark.


🚀Tech Stack

Layer                      Technology

Frontend                   React + TypeScript + TailwindCSS

Backend                    Node.js + Express

Realtime                   Socket.IO

Database                   MySQL

Notifications              Nodemailer (Gmail), Twilio (SMS)


⚙️ Installation

1. Clone & Install

git clone https://github.com/your-repo/cctv-monitor

cd backend

npm install

3. Setup .env

PORT=3001

DB_HOST=localhost

DB_USER=root

DB_PASS=your_password

DB_NAME=cctv_monitor

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_app_password

EMAIL_TO=recipient@example.com

TWILIO_ACCOUNT_SID=your_sid

TWILIO_AUTH_TOKEN=your_token

TWILIO_PHONE_FROM=+1XXXXXXXXXX

TWILIO_PHONE_TO=+91XXXXXXXXXX

NOTIFICATIONS_ENABLED=true

EMAIL_NOTIFICATIONS=true

SMS_NOTIFICATIONS=true

3. Start Backend

node server.js

5. Start Frontend

npm install

npm run dev

Visit: http://localhost:5173


📻 Camera Setup (Using IP Webcam App)

1) Install IP Webcam on Android

2) Start server in app
   
3) Use displayed IP like http://xxx.xxx.1.100:8080
   
4) Input full IP in Add Camera Modal on dashboard


🚀 Future Scope

🔐 Authentication for dashboard access

📊 Alert analytics & visualization

🧠 Blur/Smoke/Fire detection using OpenCV + AI

☁️ Cloud deployment on Railway / Render

