export const environment = {
  production: false,
  apiBaseUrl: (globalThis as any)['process']?.env?.['VITE_API_BASE_URL'] ?? 'http://localhost:8000'
};
