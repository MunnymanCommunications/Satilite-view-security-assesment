
import React from 'react';

const CameraIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55a2.25 2.25 0 01.95 1.95v.1A2.25 2.25 0 0118.25 14H17m-5-4v.01M12 12v.01M12 12a2 2 0 012 2v.01M12 12a2 2 0 01-2-2V6a2 2 0 012-2h1a2 2 0 012 2v2m-1 4h-1a2 2 0 01-2-2v-2m-1 4H9a2 2 0 01-2-2v-2m5 4h1a2 2 0 012 2v.01M12 16a2 2 0 01-2 2H9a2 2 0 01-2-2v-2m9-4h1a2 2 0 012 2v2m-3-4a2 2 0 012-2h1a2 2 0 012 2v2" />
  </svg>
);

export default CameraIcon;
