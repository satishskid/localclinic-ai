import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'browser-extension/',
                'scripts/',
                '*.config.js'
            ]
        },
        include: ['tests/**/*.test.js'],
        exclude: ['node_modules', 'dist', 'browser-extension']
    }
});
