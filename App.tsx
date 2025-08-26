import React, { useState, useCallback } from 'react';
import { AnalysisStep, SecurityAnalysis } from './types';
import { getAerialViewFromAddress, getSecurityAnalysis } from './services/geminiService';
import LocationInput from './components/LocationInput';
import AerialView from './components/AerialView';
import SecurityReport from './components/SecurityReport';
import ErrorMessage from './components/ErrorMessage';
import MapPinIcon from './components/icons/MapPinIcon';
import ApiConfigurationMessage from './components/ApiConfigurationMessage';

const geminiApiKey = process.env.API_KEY;
const googleMapsApiKey = process.env.MAPS_API_KEY;

const App: React.FC = () => {
  const [location, setLocation] = useState('');
  const [aerialImage, setAerialImage] = useState<string | null>(null);
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null);
  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.INPUT);
  const [error, setError] = useState<string>('');
  
  const isLoading = step === AnalysisStep.FETCHING_IMAGE || step === AnalysisStep.ANALYZING;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || isLoading) return;

    setError('');
    setAerialImage(null);
    setSecurityAnalysis(null);

    try {
      setStep(AnalysisStep.FETCHING_IMAGE);
      const imageUrl = await getAerialViewFromAddress(location);
      setAerialImage(imageUrl);

      setStep(AnalysisStep.ANALYZING);
      const analysis = await getSecurityAnalysis(location, imageUrl);
      setSecurityAnalysis(analysis);

      setStep(AnalysisStep.COMPLETE);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setStep(AnalysisStep.ERROR);
    }
  }, [location, isLoading]);
  
  const handleReset = () => {
    setLocation('');
    setAerialImage(null);
    setSecurityAnalysis(null);
    setError('');
    setStep(AnalysisStep.INPUT);
  };

  const getLoadingMessage = (): string => {
    if (step === AnalysisStep.FETCHING_IMAGE) {
      return "Retrieving satellite imagery from Google Maps...";
    }
    if (step === AnalysisStep.ANALYZING) {
      return "Analyzing property image and recommending camera placements...";
    }
    return "";
  }

  if (!geminiApiKey || !googleMapsApiKey) {
    return <ApiConfigurationMessage />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8 font-sans relative">
      <header className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <MapPinIcon className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                AI Security Surveyor
            </h1>
        </div>
        <p className="text-lg text-gray-400 max-w-2xl">
          Enter a property address to retrieve real satellite imagery and receive a complete security camera placement plan.
        </p>
      </header>

      <main className="w-full flex flex-col items-center gap-8">
        {step === AnalysisStep.INPUT && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <LocationInput 
              location={location}
              setLocation={setLocation}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        )}

        {(step === AnalysisStep.ERROR) && (
          <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in">
             <LocationInput 
              location={location}
              setLocation={setLocation}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            <ErrorMessage message={error} />
            <button 
              onClick={handleReset} 
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {(step !== AnalysisStep.INPUT && step !== AnalysisStep.ERROR) && (
          <div className="w-full max-w-5xl flex flex-col items-center gap-8 animate-fade-in">
            <div className="w-full p-4 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <p className="text-gray-300 font-mono text-sm break-words"><span className="font-bold text-blue-400">Address:</span> {location}</p>
            </div>
            <AerialView imageUrl={aerialImage} />
            
            {isLoading && (
              <div className="text-center text-gray-400 p-4">
                <p>{getLoadingMessage()}</p>
              </div>
            )}
            
            <SecurityReport analysis={securityAnalysis} />

            {step === AnalysisStep.COMPLETE && (
              <button 
                onClick={handleReset} 
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg shadow-lg"
              >
                Start New Analysis
              </button>
            )}
          </div>
        )}
      </main>
      
      <footer className="mt-auto pt-8 text-center text-gray-600 text-sm">
        <p>Powered by Google Gemini & Google Maps. For informational purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
