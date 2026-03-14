process.env.TZ = 'America/Tegucigalpa';

import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Variable de entorno requerida: ${key}`);
    process.exit(1);
  }
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URI: process.env.MONGO_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};
