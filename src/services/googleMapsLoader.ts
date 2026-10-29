import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let isConfigured = false;
let initPromise: Promise<typeof google> | null = null;

export const loadGoogleMaps = async (): Promise<typeof google> => {
  if (!isConfigured) {
    const apiKey =
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      'AIzaSyBKCGXg4JwHkRITTlUAb9dHlsyF7jOJCc8';

    setOptions({
      key: apiKey,
      v: 'weekly',
    });
    isConfigured = true;
  }

  if (!initPromise) {
    initPromise = (async () => {
      await importLibrary('maps');
      await importLibrary('places');
      return window.google;
    })();
  }

  return initPromise;
};
