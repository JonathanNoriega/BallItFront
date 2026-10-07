export const environment = {
  production: true,
  apiBaseUrl: (globalThis as any)['process']?.env?.['VITE_API_BASE_URL'] ?? 'http://localhost:8000'
};
