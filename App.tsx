import React, { useState, useCallback, useRef } from 'react';
import { AnalysisStep, SecurityAnalysis } from './types';
import { getAerialViewFromAddress, getSecurityAnalysis, MapsRequestDeniedError } from './services/geminiService';
import { generatePdfReport } from './services/pdfGenerator';
import LocationInput from './components/LocationInput';
import AerialView from './components/AerialView';
import SecurityReport from './components/SecurityReport';
import ErrorMessage from './components/ErrorMessage';
import MapPinIcon from './components/icons/MapPinIcon';
import ApiConfigurationMessage from './components/ApiConfigurationMessage';
import PrinterIcon from './components/icons/PrinterIcon';
import LoadingSpinner from './components/LoadingSpinner';


const MIN_ZOOM = 17;
const MAX_ZOOM = 21;
const INITIAL_ZOOM = 19;

// Safely check for environment variables.
// In a Vite/build-tool environment, these are replaced at build time.
// If there's no build step, `import.meta.env` will be undefined.
const ARE_KEYS_CONFIGURED = import.meta.env?.VITE_API_KEY && import.meta.env?.VITE_MAPS_API_KEY;


const App: React.FC = () => {
  const [location, setLocation] = useState('');
  const [aerialImage, setAerialImage] = useState<string | null>(null);
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null);
  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.INPUT);
  const [error, setError] = useState<string>('');
  const [hoveredPlacement, setHoveredPlacement] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(INITIAL_ZOOM);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const aerialViewRef = useRef<HTMLDivElement>(null);
  
  // If keys aren't available, show the configuration guide instead of the app.
  // This prevents crashes and provides clear instructions to the user.
  if (!ARE_KEYS_CONFIGURED) {
    return <ApiConfigurationMessage />;
  }
  
  const isLoading = step === AnalysisStep.FETCHING_IMAGE || step === AnalysisStep.ANALYZING;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || isLoading) return;

    setError('');
    setAerialImage(null);
    setSecurityAnalysis(null);
    setZoomLevel(INITIAL_ZOOM);

    try {
      setStep(AnalysisStep.FETCHING_IMAGE);
      const imageUrl = await getAerialViewFromAddress(location, INITIAL_ZOOM);
      setAerialImage(imageUrl);

      setStep(AnalysisStep.ANALYZING);
      const analysis = await getSecurityAnalysis(location, imageUrl);
      setSecurityAnalysis(analysis);

      setStep(AnalysisStep.COMPLETE);
    } catch (err) {
       if (err instanceof MapsRequestDeniedError) {
        const origin = window.location.origin;
        const detailedError = `Request Denied by Google Maps.\n\nThis usually means your API key is restricted. To fix this, you must add your website's URL to the allowed list in your Google Cloud Console.\n\n1. Go to Google Cloud Console -> APIs & Services -> Credentials.\n2. Find your Maps API Key and click to edit it.\n3. Under "Application restrictions", select "Websites".\n4. Click "Add" and enter the following URL:\n\n   ${origin}/*\n\nIt may take a few minutes for the change to take effect.`;
        setError(detailedError);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
      }
      setStep(AnalysisStep.ERROR);
    }
  }, [location, isLoading]);

  const handleZoomChange = useCallback(async (newZoom: number) => {
    if (isImageLoading || !location || newZoom < MIN_ZOOM || newZoom > MAX_ZOOM) {
      return;
    }
    setIsImageLoading(true);
    setError('');
    try {
      const imageUrl = await getAerialViewFromAddress(location, newZoom);
      setAerialImage(imageUrl);
      setZoomLevel(newZoom);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching the new map image.';
      setError(errorMessage);
    } finally {
      setIsImageLoading(false);
    }
  }, [location, isImageLoading]);

  const handleGenerateReport = async () => {
    if (!aerialViewRef.current || !securityAnalysis || isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    setError('');
    try {
      await generatePdfReport(aerialViewRef.current, securityAnalysis, location);
    } catch (err) {
       console.error("Failed to generate PDF:", err);
       const errorMessage = err instanceof Error ? `Failed to generate PDF: ${err.message}` : 'An unknown error occurred during PDF generation.';
       setError(errorMessage);
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  const handleReset = () => {
    setLocation('');
    setAerialImage(null);
    setSecurityAnalysis(null);
    setError('');
    setStep(AnalysisStep.INPUT);
    setZoomLevel(INITIAL_ZOOM);
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

  const canZoomIn = zoomLevel < MAX_ZOOM;
  const canZoomOut = zoomLevel > MIN_ZOOM;

  return (
    <div className="min-h-screen bg-indigo-950 text-white flex flex-col items-center p-4 sm:p-8 font-sans relative">
      <header className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <MapPinIcon className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                AI Security Surveyor
            </h1>
        </div>
        <p className="text-lg text-indigo-300 max-w-2xl">
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
              className="mt-4 bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {(step !== AnalysisStep.INPUT && step !== AnalysisStep.ERROR) && (
          <div className="w-full max-w-5xl flex flex-col items-center gap-8 animate-fade-in">
            <div className="w-full p-4 bg-indigo-900 rounded-xl shadow-lg border border-indigo-800">
                <p className="text-gray-300 font-mono text-sm break-words"><span className="font-bold text-blue-400">Address:</span> {location}</p>
            </div>
            <AerialView 
              ref={aerialViewRef}
              imageUrl={aerialImage}
              placements={securityAnalysis?.placements}
              hoveredPlacement={hoveredPlacement}
              isZooming={isImageLoading}
              onZoomIn={() => handleZoomChange(zoomLevel + 1)}
              onZoomOut={() => handleZoomChange(zoomLevel - 1)}
              canZoomIn={canZoomIn}
              canZoomOut={canZoomOut}
            />
            
            {error && <ErrorMessage message={error} />}

            {isLoading && (
              <div className="text-center text-indigo-300 p-4">
                <p>{getLoadingMessage()}</p>
              </div>
            )}
            
            <SecurityReport 
              analysis={securityAnalysis}
              onPlacementHover={setHoveredPlacement}
            />

            {step === AnalysisStep.COMPLETE && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleReset} 
                  className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg shadow-lg"
                >
                  Start New Analysis
                </button>
                <button 
                  onClick={handleGenerateReport} 
                  disabled={isGeneratingPdf}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white font-bold py-3 px-8 rounded-full transition-colors text-lg shadow-lg flex items-center justify-center gap-3"
                >
                  {isGeneratingPdf ? <LoadingSpinner /> : <PrinterIcon className="w-6 h-6"/>}
                  <span>{isGeneratingPdf ? 'Generating...' : 'Export Report'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="mt-auto pt-8 text-center text-indigo-400 text-sm">
        <p>Powered by Google Gemini & Google Maps. For informational purposes only.</p>
      </footer>
    </div>
  );
};

export default App;