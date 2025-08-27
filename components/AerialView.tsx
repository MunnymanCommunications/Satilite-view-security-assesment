import React from 'react';
import { CameraPlacement } from '../types';

interface AerialViewProps {
  imageUrl: string | null;
  placements?: CameraPlacement[] | null;
  hoveredPlacement?: number | null;
}

const MARKER_COLORS = [
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#60a5fa', // blue-400
  '#f87171', // red-400
  '#a78bfa', // violet-400
  '#f472b6', // pink-400
];

const AerialView: React.FC<AerialViewProps> = ({ imageUrl, placements, hoveredPlacement }) => {
  if (!imageUrl) {
    return (
      <div className="w-full aspect-video bg-indigo-900 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-indigo-400">Generating aerial view...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-2xl border-4 border-indigo-800 relative">
      <img src={imageUrl} alt="AI-generated aerial view of property" className="w-full h-full object-cover" />
      {placements?.map((placement, index) => {
        const isHovered = hoveredPlacement === index;
        const color = MARKER_COLORS[index % MARKER_COLORS.length];
        return (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${placement.coordinates.x}%`, top: `${placement.coordinates.y}%` }}
            aria-hidden="true"
          >
            {/* Coverage area */}
            <div
              className={`absolute w-32 h-32 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isHovered ? 'scale-100 opacity-30' : 'scale-0 opacity-0'}`}
              style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
            />
            {/* Marker dot */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform duration-300"
              style={{ 
                backgroundColor: color,
                transform: `scale(${isHovered ? 1.5 : 1})`
               }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AerialView;