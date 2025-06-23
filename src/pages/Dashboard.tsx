import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CameraGrid from '../components/CameraGrid';
import AddCameraModal from '../components/AddCameraModal';
import { Plus } from 'lucide-react';

interface CameraData {
  name: string;
  ipAddress: string;
  streamUrl?: string;  // optional now
}


const Dashboard = () => {
  const [cameras, setCameras] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    // Fetch initial cameras
    fetchCameras();

    // Listen for real-time camera updates
    socket.on('cameraStatusUpdate', (data) => {
      setCameras(data.cameras);
    });

    return () => {
      socket.disconnect(); // no return here
    };
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cameras');
      const data = await response.json();
      setCameras(data);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cameraData),
      });

      if (response.ok) {
        fetchCameras();
        setShowAddModal(false);
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Failed to add camera:', error);
      alert('Failed to add camera');
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
            Manage and monitor up to 4 IP cameras • {(cameras || []).length}/4 cameras configured
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


