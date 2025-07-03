// Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import CameraGrid from '../components/CameraGrid';
import AddCameraModal from '../components/AddCameraModal';
import { Plus } from 'lucide-react';

interface Camera {
  id: string;
  name: string;
  ipAddress: string; // ✅ match case exactly
  streamUrl: string;
  status: string;
  addedAt: string;
  lastChecked: string;
}

interface CameraData {
  name: string;
  ipAddress: string;
}

const Dashboard: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');

    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      newSocket.emit('requestStatus');
    });

    newSocket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from WebSocket');
    });

    newSocket.on('cameraStatusUpdate', (data) => {
      if (data?.cameras) {
        const mapped = data.cameras.map((c: any) => ({
          id: c.id,
          name: c.name,
          ipAddress: c.ip_address,
          streamUrl: c.stream_url,
          status: c.status,
          addedAt: c.added_at,
          lastChecked: c.last_checked,
        }));
        setCameras(mapped);
        console.log('📡 Real-time update received from server');
      }
    });

    setSocket(newSocket);
    fetchCameras();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cameras');
      const rawData = await response.json();

      const mapped = rawData.map((c: any) => ({
        id: c.id,
        name: c.name,
        ipAddress: c.ip_address,
        streamUrl: c.stream_url,
        status: c.status,
        addedAt: c.added_at,
        lastChecked: c.last_checked,
      }));

      setCameras(mapped);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCamera = async (cameraData: CameraData) => {
    try {
      const response = await fetch('http://localhost:3001/api/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cameraData),
      });

      const result = await response.json();

      if (response.ok) {
        fetchCameras();
        setShowAddModal(false);
      } else {
        alert(result?.error || 'Failed to add camera');
      }
    } catch (error) {
      console.error('❌ Failed to add camera:', error);
      alert('Server not reachable or invalid response');
    }
  };

  const deleteCamera = async (cameraId: string) => {
    if (!confirm('Are you sure you want to delete this camera?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/cameras/${cameraId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCameras();
      }
    } catch (error) {
      console.error('Failed to delete camera:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-lg">Loading cameras...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Camera Dashboard</h1>
          <p className="text-gray-400">
            Manage and monitor up to 4 IP cameras • {cameras.length}/4 cameras configured
          </p>
        </div>
        {cameras.length < 4 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Camera</span>
          </button>
        )}
      </div>

      <CameraGrid cameras={cameras} onDeleteCamera={deleteCamera} />

      {showAddModal && (
        <AddCameraModal
          onClose={() => setShowAddModal(false)}
          onAddCamera={addCamera}
        />
      )}
    </div>
  );
};

export default Dashboard;
