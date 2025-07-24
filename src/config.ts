

process.loadEnvFile()

type Config = {
    api: APIConfig;
    jwt: JWTConfig;
    db: DbConfig;
}

type APIConfig = {
    port: number;
    platform: string;
}

type JWTConfig = {
    secret: string;
    tokenDuration: number;
    refreshDuration: number;
}

type DbConfig = {
    dbUrl: string;
}

export const config: Config = {
    api: {
        port: Number(envOrThrow("PORT")),
        platform: envOrThrow("PLATFORM")
    },
    jwt: {
        secret: envOrThrow("JWT_SECRET"),
        tokenDuration: 60 * 60,                     // 1 hours in seconds
        refreshDuration: 60 * 60 * 24 * 60 * 1000   // 60 days in milliseconds
    },
    db: {
        dbUrl: envOrThrow("DB_URL")
    }
}

export function envOrThrow(key: string) {
    const value = process.env[key];
    if (value) {
        return value;
    }
    throw new Error(`Environment variable not present: ${key}`)
}