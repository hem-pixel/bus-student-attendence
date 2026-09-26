import React from 'react';

export const DashboardCard = ({
  title,
  value,
  icon,
  color = 'blue',
  trend,
  trendUp = true
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    amber: 'bg-amber-50 border-amber-200'
  };

  const iconBgColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600'
  };

  return (
    <div className={`border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-md ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value !== undefined ? value : 0}</p>
          {trend && (
            <p className={`text-sm mt-2 font-medium flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm ${iconBgColors[color] || iconBgColors.blue}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
