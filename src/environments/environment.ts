declare const __ENV_API_BASE_URL__: string | undefined;

export const environment = {
  production: false,
  // Se puede inyectar via window.__env en Electron main, o se usa el default
  apiBaseUrl: (typeof window !== 'undefined' && (window as any).__env?.API_BASE_URL)
    || 'http://localhost:8000'
};
