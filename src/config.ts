import fs from "fs";

if (fs.existsSync(".env")) {
  process.loadEnvFile();
}

type Config = {
  api: APIConfig;
  jwt: JWTConfig;
  db: DbConfig;
  cron: CronConfig;
};

type APIConfig = {
  port: number;
  platform: string;
};

type JWTConfig = {
  secret: string;
  tokenDuration: number;
  refreshDuration: number;
};

type DbConfig = {
  dbUrl: string;
};

type CronConfig = {
  firstDayOfMonth: string;
};

const port = Number(envOrThrow("PORT"));
const platform = envOrThrow("PLATFORM");
const secret = envOrThrow("JWT_SECRET");
const dbUrl = envOrThrow("DB_URL");

export const config: Config = {
  api: {
    port: port,
    platform: platform,
  },
  jwt: {
    secret: secret,
    tokenDuration: 60 * 60, // 1 hours in seconds
    refreshDuration: 60 * 60 * 24 * 60 * 1000, // 60 days in milliseconds
  },
  db: {
    dbUrl: dbUrl,
  },
  cron: {
    firstDayOfMonth: "0 0 0 1 * *", // run @ midnight on the first of the month
  },
};

export function envOrThrow(key: string) {
  const value = process.env[String(key)]!;
  if (value) {
    return value;
  }
  throw new Error(`Environment variable not present: ${key}`);
}
