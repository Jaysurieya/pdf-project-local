// Type augmentation for import.meta.env
declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly NODE_ENV: string;
    readonly [key: string]: string | undefined;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Environment variables utility
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || defaultValue || '';
};

// Specific environment variables for the application
export const config = {
  gemini: {
    apiKey: getEnvVar('VITE_GEMINI_API_KEY')
  },
  app: {
    env: getEnvVar('NODE_ENV', 'development')
  }
};