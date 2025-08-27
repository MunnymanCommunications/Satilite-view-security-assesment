import React, { useState } from 'react';
import KeyIcon from './icons/KeyIcon';

interface ApiConfigurationProps {
  onKeysSubmit: (geminiKey: string, mapsKey: string) => void;
}

const ApiConfiguration: React.FC<ApiConfigurationProps> = ({ onKeysSubmit }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [mapsKey, setMapsKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (geminiKey.trim() && mapsKey.trim()) {
      onKeysSubmit(geminiKey.trim(), mapsKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-indigo-900/50 backdrop-blur-sm rounded-xl p-8 border border-blue-500/50 shadow-2xl animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <KeyIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">API Key Configuration</h1>
        </div>
        <p className="text-gray-300 leading-relaxed mb-6">
          Please enter your API keys to use the application. These keys are stored only in your browser's memory for this session and are not saved anywhere.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-300 mb-2">
              Google Gemini API Key
            </label>
            <input
              id="gemini-key"
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="w-full bg-indigo-950/70 border border-indigo-800 text-white rounded-lg px-4 py-3 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-label="Google Gemini API Key Input"
            />
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get your key from Google AI Studio</a>
          </div>
          <div>
            <label htmlFor="maps-key" className="block text-sm font-medium text-gray-300 mb-2">
              Google Maps API Key
            </label>
            <input
              id="maps-key"
              type="password"
              value={mapsKey}
              onChange={(e) => setMapsKey(e.target.value)}
              placeholder="Enter your Google Maps API Key"
              className="w-full bg-indigo-950/70 border border-indigo-800 text-white rounded-lg px-4 py-3 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-label="Google Maps API Key Input"
            />
            <p className="text-xs text-indigo-300 mt-1">Ensure 'Geocoding API' and 'Maps Static API' are enabled.</p>
             <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Get your key from Google Cloud Console</a>
          </div>
          <button
            type="submit"
            disabled={!geminiKey.trim() || !mapsKey.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiConfiguration;