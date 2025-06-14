import React from 'react';

interface StatusCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, icon: Icon, color, description }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-gray-500 text-xs mt-1">{description}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatusCard;