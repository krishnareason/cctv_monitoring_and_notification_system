import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import StatusCard from '../components/StatusCard';
import AlertsPanel from '../components/AlertsPanel';
import { Camera, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    activeAlerts: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    // Fetch initial camera status
    fetch('http://localhost:3001/api/cameras/status')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch camera status:', err));

    // Fetch initial alerts
    fetchAlerts();

    // Listen for real-time updates
    socket.on('cameraStatusUpdate', (data) => {
      setStats(data.stats);
      setLastUpdate(new Date().toLocaleTimeString());
    });

    socket.on('newAlert', (alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      // Optional: Play alert sound
      // new Audio('/alert-sound.mp3').play().catch(() => {});
    });

    return () => socket.disconnect();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cameras/alerts');
      if (response.ok) {
        const alertsData = await response.json();
        setAlerts(alertsData);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const statusCards = [
    {
      title: 'Total Cameras',
      value: stats.total,
      icon: Camera,
      color: 'bg-blue-600',
      description: 'Configured cameras'
    },
    {
      title: 'Online Cameras', 
      value: stats.online,
      icon: Wifi,
      color: 'bg-green-600',
      description: 'Active feeds'
    },
    {
      title: 'Offline Cameras',
      value: stats.offline, 
      icon: WifiOff,
      color: 'bg-red-600',
      description: 'Connection issues'
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts,
      icon: AlertTriangle,
      color: 'bg-orange-600',
      description: 'Require attention'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Status</h1>
        <p className="text-gray-400">
          Real-time monitoring dashboard • Last updated: {lastUpdate || 'Loading...'}
        </p>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card, index) => (
          <StatusCard key={index} {...card} />
        ))}
      </div>

      {/* Alerts Panel */}
      <AlertsPanel alerts={alerts} />

      {/* Auto-refresh indicator */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Auto-refreshing every 8 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default Home;