import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LocationInputProps {
  location: string;
  setLocation: (location: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  buttonText?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ location, setLocation, onSubmit, isLoading, buttonText = 'Analyze' }) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl">
      <div className="flex items-center bg-indigo-900 border-2 border-indigo-800 rounded-full shadow-lg overflow-hidden">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter a full property address (e.g., 123 Main St, Anytown, USA)"
          className="w-full bg-transparent text-white px-6 py-4 placeholder-indigo-400 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-4 px-8 transition-colors duration-300 flex items-center justify-center min-w-[180px]"
        >
          {isLoading ? <LoadingSpinner /> : buttonText}
        </button>
      </div>
    </form>
  );
};

export default LocationInput;