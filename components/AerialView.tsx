
import React from 'react';

interface AerialViewProps {
  imageUrl: string | null;
}

const AerialView: React.FC<AerialViewProps> = ({ imageUrl }) => {
  if (!imageUrl) {
    return (
      <div className="w-full aspect-video bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Generating aerial view...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700">
      <img src={imageUrl} alt="AI-generated aerial view of property" className="w-full h-full object-cover" />
    </div>
  );
};

export default AerialView;
