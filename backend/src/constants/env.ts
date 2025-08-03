function getEnv(key: string, defaultValue?: string) {
  const value = process.env[key] || defaultValue;
  if (!value) throw new Error(`Missing env key - ${key}`);
  return value;
}

export const PORT = getEnv("PORT", "3000");
export const MONGO_URI = getEnv("MONGO_URI");
export const NODE_ENV = getEnv("NODE_ENV", "development");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
export const EMAIL_SENDER = getEnv("EMAIL_SENDER");
export const RESEND_API_KEY = getEnv("RESEND_API_KEY");
