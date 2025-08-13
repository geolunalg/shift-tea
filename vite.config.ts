// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';
import { builtinModules } from 'module';
import pkg from './package.json';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/server.ts'),
            formats: ['es'],
            fileName: () => 'server.js',
        },
        rollupOptions: {
            external: [
                ...builtinModules,
                ...Object.keys(pkg.dependencies || {}),
            ],
        },
        outDir: 'dist',
        emptyOutDir: true,
        target: 'node22',
    },
});
