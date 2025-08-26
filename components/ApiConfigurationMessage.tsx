import React from 'react';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

const ApiConfigurationMessage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl p-8 border border-red-500/50 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          <h1 className="text-2xl font-bold text-white">Application Not Configured</h1>
        </div>
        <p className="text-gray-300 leading-relaxed mb-6">
          This application requires API keys for Google Gemini and Google Maps to function. These keys must be configured as environment variables in your deployment environment.
        </p>
        <div className="space-y-4 bg-gray-900/70 p-4 rounded-lg border border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Google Gemini API Key
            </label>
            <code className="text-sm text-cyan-300 bg-gray-800 px-2 py-1 rounded-md mt-1 block">API_KEY</code>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get your key from Google AI Studio</a>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Google Maps API Key
            </label>
            <code className="text-sm text-cyan-300 bg-gray-800 px-2 py-1 rounded-md mt-1 block">MAPS_API_KEY</code>
             <p className="text-xs text-gray-400 mt-1">Ensure 'Geocoding API' and 'Maps Static API' are enabled.</p>
             <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get your key from Google Cloud Console</a>
          </div>
        </div>
         <p className="text-gray-400 text-sm mt-6">
          Once you have configured these variables in your hosting provider's settings, please redeploy your application.
        </p>
      </div>
    </div>
  );
};

export default ApiConfigurationMessage;
