// FIX: Removed the <reference> directive for "vite/client" to resolve a type definition loading error.
// The ambient interface declarations below are sufficient for the app's needs.

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
