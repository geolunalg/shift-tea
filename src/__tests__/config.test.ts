import { describe, it, expect, beforeEach, vi } from 'vitest'

// This must be a dynamic import to ensure fresh loading after env changes
const loadConfig = async () => {
    return await import('@/config')
}

describe('config', () => {
    const originalEnv = process.env

    beforeEach(() => {
        vi.resetModules() // Clear module cache
        process.env = { ...originalEnv } // Reset env
    })

    it('should populate config with all required environment variables', async () => {
        process.env.PORT = '3000'
        process.env.PLATFORM = 'web'
        process.env.JWT_SECRET = 'supersecret'
        process.env.DB_URL = 'mongodb://localhost:27017/db'

        const { config } = await loadConfig()

        expect(config.api.port).toBe(3000)
        expect(config.api.platform).toBe('web')
        expect(config.jwt.secret).toBe('supersecret')
        expect(config.jwt.tokenDuration).toBe(60 * 60)
        expect(config.jwt.refreshDuration).toBe(60 * 60 * 24 * 60 * 1000)
        expect(config.db.dbUrl).toBe('mongodb://localhost:27017/db')
    })

    it('should throw if required env var is missing', async () => {
        delete process.env.PORT // Missing

        await expect(loadConfig()).rejects.toThrow('Environment variable not present: PORT')
    })
})
