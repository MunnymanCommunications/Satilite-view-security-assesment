// Fix: Removed Vite-specific types and defined types for process.env to align with coding guidelines.
// This file provides type definitions for environment variables accessed via `process.env`.
// The build system is expected to replace these with actual values.

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The API key for Google Gemini.
     */
    readonly API_KEY: string;
    /**
     * The API key for Google Maps Platform.
     */
    readonly MAPS_API_KEY: string;
  }
}
