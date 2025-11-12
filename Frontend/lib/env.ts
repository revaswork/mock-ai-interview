// Environment variables helper
// @ts-ignore - Next.js injects process.env at build time
export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
} as const;
