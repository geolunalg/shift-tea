import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock modules before importing the server
vi.mock('@/app', () => ({
    app: { listen: vi.fn((port, cb) => cb && cb()) }
}));
vi.mock('@/config', () => ({
    config: { api: { port: 1234 } }
}));
const generateDaysOfFullYear = vi.fn(() => Promise.resolve());
const cronJobsSetup = vi.fn();
vi.mock('@/cron', () => ({
    generateDaysOfFullYear,
    cronJobsSetup
}));

describe('server.ts', () => {
    let logSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;
    let listenSpy: any;

    beforeEach(async () => {
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        generateDaysOfFullYear.mockClear();
        cronJobsSetup.mockClear();
        vi.resetModules();
        // Import listenSpy after mocks and before importing server
        listenSpy = (await import('@/app')).app.listen;
    });

    afterEach(() => {
        logSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('should start server and call generateDaysOfFullYear and cronJobsSetup', async () => {
        await import('@/server');
        expect(listenSpy).toHaveBeenCalledWith(1234, expect.any(Function));
        expect(logSpy).toHaveBeenCalledWith('Server listening at http://localhost:1234');
        expect(generateDaysOfFullYear).toHaveBeenCalled();
        expect(cronJobsSetup).toHaveBeenCalled();
    });

    it('should catch errors from generateDaysOfFullYear', async () => {
        generateDaysOfFullYear.mockImplementationOnce(() => Promise.reject(new Error('fail')));
        await import('@/server');
        expect(errorSpy).toHaveBeenCalled();
    });
});