import React, { useState } from 'react';
import { X, Camera, Wifi } from 'lucide-react';

interface AddCameraModalProps {
  onClose: () => void;
  onAddCamera: (data: { name: string; ipAddress: string }) => void;
}

const AddCameraModal: React.FC<AddCameraModalProps> = ({ onClose, onAddCamera }) => {
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Camera name is required');
      return;
    }

    if (!formData.ipAddress.trim()) {
      setError('IP address is required');
      return;
    }

    // Basic IP validation
    const ipRegex = /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:8080$/;
    if (!ipRegex.test(formData.ipAddress)) {
      setError('Please enter a valid IP address format: http://192.168.x.x:8080');
      return;
    }

    onAddCamera(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Add New Camera</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Camera Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Main Gate, Living Room"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-300 mb-2">
                IP Address
              </label>
              <input
                type="text"
                id="ipAddress"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleChange}
                placeholder="http://192.168.1.100:8080"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Setup Instructions */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Wifi className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium text-sm">Setup Instructions:</p>
                <ol className="text-gray-300 text-xs mt-2 space-y-1">
                  <li>1. Install "IP Webcam" app on your phone</li>
                  <li>2. Start the server in the app</li>
                  <li>3. Note the IP address shown (e.g., 192.168.1.100)</li>
                  <li>4. Enter the full URL with port 8080</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add Camera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCameraModal;