import React from 'react';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

const ApiConfigurationMessage: React.FC = () => {
  return (
    <div className="min-h-screen bg-indigo-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-3xl bg-indigo-900 rounded-xl p-8 border border-red-500/50 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          <h1 className="text-2xl font-bold text-white">Action Required: Configure API Keys</h1>
        </div>
        <p className="text-gray-300 leading-relaxed mb-4">
          It looks like your API keys are not available to the application. This is a common setup issue with web apps.
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          For security reasons, API keys are not written directly in the code. Instead, they are loaded from your hosting environment during the application's "build" process. Most build tools (like Vite) require a special prefix for these variables to be exposed to the app.
        </p>
        
        <div className="bg-indigo-950/70 p-6 rounded-lg border border-indigo-800 space-y-6">
          <h2 className="text-lg font-semibold text-white">How to Fix:</h2>
          <div className="space-y-2">
             <p className="text-gray-300">In your deployment service (e.g., Coolify, Vercel, Netlify), find where you set your environment variables and update them as follows:</p>
             <ul className="list-disc list-inside text-indigo-300 pl-2 space-y-2">
                <li>Rename <code className="text-sm text-cyan-300 bg-indigo-900 px-2 py-1 rounded-md">API_KEY</code> to <code className="text-sm text-green-300 bg-indigo-900 px-2 py-1 rounded-md">VITE_API_KEY</code></li>
                <li>Rename <code className="text-sm text-cyan-300 bg-indigo-900 px-2 py-1 rounded-md">MAPS_API_KEY</code> to <code className="text-sm text-green-300 bg-indigo-900 px-2 py-1 rounded-md">VITE_MAPS_API_KEY</code></li>
             </ul>
          </div>

          <div>
             <h3 className="font-medium text-gray-200 mb-2">Google Gemini API Key</h3>
             <code className="text-sm text-green-300 bg-indigo-900 px-2 py-1 rounded-md mt-1 block">VITE_API_KEY</code>
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get your key from Google AI Studio</a>
           </div>
           <div>
             <h3 className="font-medium text-gray-200 mb-2">Google Maps API Key</h3>
             <code className="text-sm text-green-300 bg-indigo-900 px-2 py-1 rounded-md mt-1 block">VITE_MAPS_API_KEY</code>
              <p className="text-xs text-indigo-300 mt-1">Ensure 'Geocoding API' and 'Maps Static API' are enabled.</p>
              <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get your key from Google Cloud Console</a>
           </div>

        </div>

         <p className="text-indigo-300 text-sm mt-6">
          After renaming the variables, you must <strong className="text-gray-200">redeploy your application</strong> for the changes to take effect. The application code has been updated to look for these new variable names.
        </p>
      </div>
    </div>
  );
};

export default ApiConfigurationMessage;