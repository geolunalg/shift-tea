import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '@/app';

describe('Express App', () => {
    it('should return 404 for unknown route', async () => {
        const res = await request(app).get('/some/random/path');
        expect(res.status).toBe(404);
    });

    it('should serve static content at root', async () => {
        const res = await request(app).get('/');
        // This depends on whether there's an index.html
        expect([200]).toContain(res.status);
    });

    it('should respond to API routes', async () => {
        const res = await request(app).get('/api/v1');
        expect([404]).toContain(res.status);
    });
});
