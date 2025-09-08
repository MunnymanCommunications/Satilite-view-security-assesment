import { GoogleGenAI, Type } from "@google/genai";
import { SecurityAnalysis } from '../types';

/**
 * Custom error for when Google Maps API key is likely restricted.
 */
export class MapsRequestDeniedError extends Error {}

/**
 * Converts an image from a URL to a base64 data URL.
 * @param url The URL of the image to convert.
 * @returns A promise that resolves with the base64 data URL.
 */
async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetches a real satellite aerial view for a given address using Google Maps API.
 * @param address The property address string.
 * @param zoom The zoom level for the map (e.g., 17-21).
 * @param width The width of the desired image in pixels.
 * @param height The height of the desired image in pixels.
 * @returns A promise that resolves to a base64 data URL of the satellite image.
 */
export const getAerialViewFromAddress = async (address: string, zoom: number, width: number, height: number): Promise<string> => {
  const mapsApiKey = import.meta.env.VITE_MAPS_API_KEY;
  if (!mapsApiKey) {
    throw new Error("Google Maps API Key is not configured. Please ensure VITE_MAPS_API_KEY is set in your environment variables.");
  }
  
  // Step 1: Geocode the address to get latitude and longitude.
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${mapsApiKey}`;
  
  let geocodeData;
  try {
    const geocodeResponse = await fetch(geocodeUrl);
    geocodeData = await geocodeResponse.json();
  } catch (networkError) {
    console.error("Network error during geocoding:", networkError);
    throw new Error("A network error occurred while trying to contact Google Maps. Please check your connection.");
  }

  if (geocodeData.status !== 'OK') {
    let userFriendlyError = `Could not find location. Google Maps status: ${geocodeData.status}.`;
    switch (geocodeData.status) {
      case 'ZERO_RESULTS':
        userFriendlyError = "No location could be found for the address entered. Please check for typos and try again.";
        break;
      case 'REQUEST_DENIED':
        userFriendlyError = "The request to Google Maps was denied. This is often due to an issue with the API key. Please ensure the key is correct and that both the 'Geocoding API' and 'Maps Static API' are enabled in your Google Cloud project dashboard.";
        if (geocodeData.error_message) {
            userFriendlyError += ` (Google's message: ${geocodeData.error_message})`;
        }
        // Throw a specific error for this case
        throw new MapsRequestDeniedError(userFriendlyError);
      case 'OVER_QUERY_LIMIT':
        userFriendlyError = "The application has exceeded its daily usage limit for the Google Maps API. Please try again later.";
        break;
      case 'INVALID_REQUEST':
        userFriendlyError = "The request to Google Maps was invalid, which might indicate a problem with the address format.";
        break;
    }
    throw new Error(userFriendlyError);
  }

  if (!geocodeData.results[0]) {
      throw new Error("Google Maps returned a success status but no location data. Please try a different address.");
  }

  const { lat, lng } = geocodeData.results[0].geometry.location;

  // Step 2: Fetch the static satellite map image for the coordinates.
  // The dimensions are now passed in dynamically to match the user's viewport exactly.
  // This prevents image cropping/scaling and ensures coordinate accuracy.
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${mapsApiKey}`;

  // Step 3: Convert the fetched image to a base64 data URL to display in the app.
  try {
    const base64Image = await urlToBase64(staticMapUrl);
    return base64Image;
  } catch (error) {
    console.error("Error fetching or converting map image:", error);
    throw new Error("Failed to retrieve satellite imagery from Google Maps. This can happen if the 'Maps Static API' is not enabled for your API key, even if geocoding works.");
  }
};

/**
 * Performs a multimodal security analysis using both the property address and its satellite image.
 * @param address The property address string.
 * @param imageBase64 The base64-encoded satellite image.
 * @returns A promise that resolves to a SecurityAnalysis object.
 */
export const getSecurityAnalysis = async (address: string, imageBase64: string): Promise<SecurityAnalysis> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please ensure VITE_API_KEY is set in your environment variables.");
  }
  
  // Extract the raw base64 data from the data URL prefix.
  const base64Data = imageBase64.split(',')[1];

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg', // Google Maps Static API returns JPEG.
      data: base64Data,
    },
  };

  const textPart = {
    text: `You are an expert security risk assessor. Your task is to perform a detailed security analysis of the residential property shown in the center of the provided satellite image, located at "${address}". Assume North is at the top of the image.

Your analysis must be comprehensive. Your response must be a JSON object.

1.  **Detailed Security Overview:**
    *   Identify the primary residence in the image and focus your analysis there. Ignore adjacent properties unless they present a clear and direct security risk (e.g., an overgrown tree providing cover).
    *   Evaluate the property's perimeter, including fences, gates, and natural borders.
    *   Identify all potential access points, such as driveways, walkways, and side yards.
    *   Pinpoint specific vulnerabilities of the main building, such as ground-floor windows, sliding glass doors, secluded entryways, and areas with poor natural surveillance.
    *   Analyze environmental factors like landscaping (trees, shrubs) that could offer concealment to intruders and identify significant blind spots created by the building's architecture.

2.  **Camera Placement Recommendations:**
    *   Based on your overview, recommend optimal locations for security cameras.
    *   For each location, provide a clear description (e.g., 'Northeast corner of the house', 'Above the garage door'). Use cardinal directions (North, South, East, West).
    *   Justify each placement by explaining the specific vulnerability it addresses and the coverage it provides.
    *   Suggest an appropriate camera type (e.g., 'Wide-Angle Dome Camera with Night Vision', 'Floodlight Camera', 'Doorbell Camera').
    *   Provide precise (x, y) coordinates for each camera marker. These coordinates must be percentages from the top-left corner (e.g., {"x": 55.5, "y": 42.0}). Be as accurate as possible, as these will be used to place a visual marker directly on the image.`
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
      overview: {
        type: Type.STRING,
        description: "A comprehensive security overview of the property. It should detail perimeter security, access points, building vulnerabilities (windows, doors), and environmental factors like landscaping that could provide concealment. This should be a detailed paragraph."
      },
      placements: {
        type: Type.ARRAY,
        description: "A list of recommended camera placements.",
        items: {
          type: Type.OBJECT,
          required: ["location", "reason", "cameraType", "coordinates"],
          properties: {
            location: {
              type: Type.STRING,
              description: "The specific location for the camera, using cardinal directions (e.g., 'Northeast corner of the house', 'West-facing garage door', 'South side patio')."
            },
            reason: {
              type: Type.STRING,
              description: "The reason for placing a camera here, explaining what it covers and what threats it mitigates based on the image."
            },
            cameraType: {
              type: Type.STRING,
              description: "The recommended type of camera (e.g., 'Doorbell Camera', 'Wide-Angle Outdoor', 'Floodlight Cam')."
            },
            coordinates: {
                type: Type.OBJECT,
                description: "The precise (x, y) coordinates on the image for the camera placement, as percentages from the top-left corner.",
                required: ["x", "y"],
                properties: {
                  x: {
                    type: Type.NUMBER,
                    description: "The horizontal position (x-coordinate) as a percentage from the left edge (0-100)."
                  },
                  y: {
                    type: Type.NUMBER,
                    description: "The vertical position (y-coordinate) as a percentage from the top edge (0-100)."
                  }
                }
              }
          }
        }
      }
    }
  };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonStr = response.text.trim();
    const analysisData = JSON.parse(jsonStr);
    return analysisData as SecurityAnalysis;
  } catch (error) {
    console.error("Error getting security analysis:", error);
    throw new Error("Failed to perform security analysis. The AI model may be unable to process the request.");
  }
};