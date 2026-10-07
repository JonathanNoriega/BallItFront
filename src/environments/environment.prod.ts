export const environment = {
  production: true,
  apiBaseUrl: (typeof window !== 'undefined' && (window as any).__env?.API_BASE_URL)
    || 'http://localhost:8000'
};
