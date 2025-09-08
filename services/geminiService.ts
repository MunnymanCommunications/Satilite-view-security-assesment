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
 * @returns A promise that resolves to a base64 data URL of the satellite image.
 */
export const getAerialViewFromAddress = async (address: string, zoom: number): Promise<string> => {
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
  // Using a fixed, high-resolution size to ensure consistency for the AI analysis across all devices.
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=1024x576&maptype=satellite&key=${mapsApiKey}`;

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
    text: `You are an expert security assessor. Analyze the satellite image for the property at "${address}". Your goal is to design a CCTV layout with ZERO blind spots. Focus on the building in the center. Your response must be a single, valid JSON object that follows the schema.

Instructions:

1.  **Security Overview:** Write a detailed assessment. Analyze the perimeter, access points, building vulnerabilities, and environmental risks (landscaping, architectural blind spots).

2.  **Camera Placements:**
    *   **Coverage:** Use as many cameras as needed for 100% coverage. Overlap fields of view at critical points.
    *   **Mounting Rule:** ALL cameras MUST be mounted on existing infrastructure (e.g., building walls, eaves, roofs, existing poles). DO NOT place cameras in open areas like lawns or parking lots.
    *   **For each camera, provide:**
        *   \`location\`: Use cardinal directions (e.g., "Northwest corner of the building").
        *   \`reason\`: Explain the specific threat it mitigates.
        *   \`cameraType\`: Suggest a specific model (e.g., "4K Bullet Camera", "PTZ Dome Camera").
        *   \`coordinates\`: Provide precise {x, y} percentage coordinates for the image marker.

3.  **Equipment Summary:** Create a \`cameraSummary\` list that totals the quantity of each camera type required.
`
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
              description: "The recommended type of camera (e.g., 'Doorbell Camera', '4K Bullet Camera with Motorized Zoom', 'Floodlight Cam')."
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
      },
      cameraSummary: {
        type: Type.ARRAY,
        description: "A summary list of the total quantity required for each camera type.",
        items: {
          type: Type.OBJECT,
          required: ["cameraType", "quantity"],
          properties: {
            cameraType: {
              type: Type.STRING,
              description: "The type of camera."
            },
            quantity: {
              type: Type.NUMBER,
              description: "The total number of this camera type needed."
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