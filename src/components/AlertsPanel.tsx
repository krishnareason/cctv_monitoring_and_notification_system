import React, { useState } from 'react';
import { AlertTriangle, Wifi, Clock } from 'lucide-react';
import { Alert } from '../types'; // ✅ use shared type

interface AlertsPanelProps {
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>; // parent provides this
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, setAlerts }) => {
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [remark, setRemark] = useState('');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'offline':
        return Wifi;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'offline':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const openResolveForm = (alertId: string) => {
    setResolvingAlertId(alertId);
    setRemark('');
  };

  const cancelResolve = () => {
    setResolvingAlertId(null);
    setRemark('');
  };

  const submitResolve = async (alertId: string) => {
    const trimmedRemark = remark.trim();
    if (!trimmedRemark) return;

    try {
      const response = await fetch(`http://localhost:3001/api/cameras/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remark: trimmedRemark }),
      });

      if (!response.ok) {
        console.error('Failed to resolve alert. Server responded with:', response.status);
        return;
      }

      // ✅ Remove alert from UI
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId));

      // ✅ Reset UI state
      setResolvingAlertId(null);
      setRemark('');
    } catch (error) {
      console.error('❌ Error while resolving alert:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <span>Recent Alerts</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">Latest security notifications</p>
      </div>

      <div className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No recent alerts</p>
            <p className="text-gray-500 text-sm">All cameras are functioning normally</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => {
              const IconComponent = getAlertIcon(alert.type);
              const colorClass = getAlertColor(alert.type);

              return (
                <div
                  key={alert.id}
                  className="flex items-start space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">{alert.cameraName}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{alert.message}</p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-900/20 text-red-400">
                        {alert.type.toUpperCase()}
                      </span>

                      {resolvingAlertId === alert.id ? (
                        <div className="flex space-x-2 items-center">
                          <input
                            type="text"
                            placeholder="Enter remark"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            className="rounded px-2 py-1 text-black"
                          />
                          <button
                            onClick={() => submitResolve(alert.id)}
                            disabled={!remark.trim()}
                            className="bg-blue-600 px-3 py-1 rounded text-white disabled:opacity-50"
                          >
                            Submit
                          </button>
                          <button
                            onClick={cancelResolve}
                            className="text-gray-400 hover:text-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openResolveForm(alert.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
