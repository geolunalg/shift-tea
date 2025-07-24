

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
        tokenDuration: 60 * 60
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