export interface Environment {
  DATABASE_URL: string;
  JWT_SECRET: string;
  PORT: number;
  CORS_ORIGINS: string[];
}

export function validateEnvironment(config: Record<string, unknown>): Environment {
  const databaseUrl = String(config.DATABASE_URL ?? '');
  const jwtSecret = String(config.JWT_SECRET ?? '');
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL URL');
  }
  if (jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');

  const port = Number(config.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error('PORT must be a valid port number');

  const frontendUrl = String(config.FRONTEND_URL ?? 'http://localhost:5173').trim().replace(/\/$/, '');
  const origins = String(config.CORS_ORIGINS ?? frontendUrl)
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
  if (!origins.includes(frontendUrl)) origins.push(frontendUrl);
  if (origins.length === 0) throw new Error('CORS_ORIGINS must contain at least one origin');

  return { ...config, DATABASE_URL: databaseUrl, JWT_SECRET: jwtSecret, PORT: port, CORS_ORIGINS: origins };
}
