import React, { useState } from 'react';
import { Wifi, WifiOff, Trash2, Eye, AlertTriangle, Clock } from 'lucide-react';

interface Camera {
  id: string;
  name: string;
  ipAddress: string;
  streamUrl: string;
  status: string;
  addedAt: string;
  lastChecked: string | null;
}

interface CameraCardProps {
  camera: Camera;
  onDelete: () => void;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-400 bg-green-900/20';
      case 'offline':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const StatusIcon = camera.status === 'online' ? Wifi : WifiOff;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
      {/* Camera Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{camera.name}</h3>
            <p className="text-sm text-gray-400">{camera.ipAddress}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded ${getStatusColor(camera.status)}`}>
              <StatusIcon className="w-3 h-3" />
              <span className="text-xs font-medium capitalize">{camera.status}</span>
            </div>
            
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
              title="Delete camera"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="relative bg-gray-900 h-48">
        {camera.status === 'online' && !imageError ? (
          <img
            src={camera.streamUrl}
            alt={`${camera.name} feed`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              {camera.status === 'offline' ? (
                <>
                  <WifiOff className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Camera Offline</p>
                  <p className="text-gray-500 text-xs">No signal detected</p>
                </>
              ) : (
                <>
                  <Eye className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No Feed Available</p>
                  <p className="text-gray-500 text-xs">Check camera connection</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Live indicator */}
        {camera.status === 'online' && !imageError && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        )}
      </div>

      {/* Camera Info */}
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>
              {camera.lastChecked 
                ? `Last checked: ${new Date(camera.lastChecked).toLocaleTimeString()}`
                : 'Never checked'
              }
            </span>
          </div>
          
          <span className="text-xs">
            Added {new Date(camera.addedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CameraCard;