import React from 'react';

const TravelCard: React.FC = () => {
  const travelItems = [
    {
      title: 'Business Trip',
      location: 'New York',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Conference',
      location: 'San Francisco',
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      title: 'Vacation',
      location: 'Tokyo',
      gradient: 'from-green-400 to-green-600'
    },
    {
      title: 'Workshop',
      location: 'Berlin',
      gradient: 'from-orange-400 to-orange-600'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Upcoming Travel</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {travelItems.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl bg-gradient-to-br ${item.gradient} text-white min-h-[100px] flex flex-col justify-between`}
          >
            <div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs opacity-90">{item.location}</p>
            </div>
            <div className="text-right">
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelCard;