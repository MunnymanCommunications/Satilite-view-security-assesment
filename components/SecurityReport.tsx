
import React from 'react';
import { SecurityAnalysis, CameraPlacement } from '../types';
import CameraIcon from './icons/CameraIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface SecurityReportProps {
  analysis: SecurityAnalysis | null;
}

const PlacementCard: React.FC<{ placement: CameraPlacement }> = ({ placement }) => (
  <li className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
    <div className="flex items-center mb-3">
      <div className="bg-blue-600/20 text-blue-400 p-2 rounded-full mr-4">
        <CameraIcon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-lg text-white">{placement.location}</h4>
        <p className="text-sm text-blue-400 font-medium">{placement.cameraType}</p>
      </div>
    </div>
    <p className="text-gray-300">{placement.reason}</p>
  </li>
);

const SecurityReport: React.FC<SecurityReportProps> = ({ analysis }) => {
  if (!analysis) {
     return (
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-6"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto"></div>
            </div>
            <p className="text-gray-400 mt-4">Analyzing vulnerabilities and preparing recommendations...</p>
        </div>
     );
  }

  return (
    <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-2xl">
      <div className="flex items-center mb-6">
        <ShieldCheckIcon className="w-10 h-10 text-green-400 mr-4" />
        <h2 className="text-3xl font-bold text-white">Security Analysis</h2>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-200 mb-2">Overview</h3>
        <p className="text-gray-300 leading-relaxed">{analysis.overview}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Recommended Placements</h3>
        <ul className="space-y-4">
          {analysis.placements.map((placement, index) => (
            <PlacementCard key={index} placement={placement} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SecurityReport;
