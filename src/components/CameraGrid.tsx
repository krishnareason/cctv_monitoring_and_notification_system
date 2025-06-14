import React from 'react';
import CameraCard from './CameraCard';

interface Camera {
  id: string;
  name: string;
  ipAddress: string;
  streamUrl: string;
  status: string;
  addedAt: string;
  lastChecked: string | null;
}

interface CameraGridProps {
  cameras: Camera[];
  onDeleteCamera: (cameraId: string) => void;
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, onDeleteCamera }) => {
  if (cameras.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4\" fill="none\" stroke="currentColor\" viewBox="0 0 24 24">
              <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Cameras Configured</h3>
          <p className="text-gray-400 mb-4">Start by adding your first camera to begin monitoring</p>
          <p className="text-sm text-gray-500">
            Use the IP Webcam app on your phone and connect via the camera's IP address
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {cameras.map((camera) => (
        <CameraCard
          key={camera.id}
          camera={camera}
          onDelete={() => onDeleteCamera(camera.id)}
        />
      ))}
    </div>
  );
};

export default CameraGrid;