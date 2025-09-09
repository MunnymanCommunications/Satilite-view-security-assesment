import React from 'react';
import { CameraPlacement } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ZoomInIcon from './icons/ZoomInIcon';
import ZoomOutIcon from './icons/ZoomOutIcon';

interface AerialViewProps {
  imageUrl: string | null;
  placements?: CameraPlacement[] | null;
  hoveredPlacement?: number | null;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

const MARKER_COLORS = [
  '#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#f472b6', 
  '#2dd4bf', '#a3e635', '#38bdf8', '#e879f9', '#fb7185', '#22d3ee', 
  '#fb923c', '#818cf8', '#d946ef', '#14b8a6', '#facc15', '#ef4444', 
  '#0ea5e9', '#6d28d9', '#db2777', '#f59e0b', '#10b981'
];


const AerialView = React.forwardRef<HTMLDivElement, AerialViewProps>(({ 
    imageUrl, 
    placements, 
    hoveredPlacement,
    scale,
    onZoomIn,
    onZoomOut,
    canZoomIn,
    canZoomOut
 }, ref) => {
  if (!imageUrl) {
    return (
      <div className="w-full aspect-video bg-indigo-900 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-indigo-400">Generating aerial view...</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="w-full aspect-video rounded-lg overflow-hidden shadow-2xl border-4 border-indigo-800 relative group bg-indigo-950">
      <div 
        className="w-full h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
      >
        <img src={imageUrl} alt="Satellite view of property" className="w-full h-full object-cover" />
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
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
        <button 
          onClick={onZoomIn} 
          disabled={!canZoomIn}
          className="bg-indigo-900/80 backdrop-blur-sm hover:bg-indigo-800 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom in"
        >
          <ZoomInIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={onZoomOut} 
          disabled={!canZoomOut}
          className="bg-indigo-900/80 backdrop-blur-sm hover:bg-indigo-800 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOutIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
});

export default AerialView;