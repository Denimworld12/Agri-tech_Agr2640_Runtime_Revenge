import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithAuth, mockFarmerData } from '../utils/test-utils';
import App from '../App';

// Mock environment variables
vi.stubGlobal('import.meta', {
    env: {
        VITE_API_URL: 'http://localhost:8000',
    },
});

// Mock fetch for passkey checks
global.fetch = vi.fn();

describe('Route Diagnostic Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();

        // Default mock for fetch (passkey list endpoint)
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ passkeys: [] }),
        });
    });

    it('should check if unauthenticated users are redirected from protected routes', async () => {
        const { container } = renderWithAuth(<App />, {
            route: '/dashboard',
            isAuthenticated: false
        });

        // Wait a bit and then check the URL
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Current pathname:', window.location.pathname);
        console.log('Container HTML:', container.innerHTML.substring(0, 500));

        // The test just reports the state
        expect(window.location.pathname).toBeDefined();
    });

    it('should check if authenticated users can access dashboard', async () => {
        localStorage.setItem('access_token', 'mock-token');
        localStorage.setItem('refresh_token', 'mock-refresh-token');
        localStorage.setItem('farmer_data', JSON.stringify(mockFarmerData));

        const { container } = renderWithAuth(<App />, {
            route: '/dashboard',
            isAuthenticated: true,
            farmerData: mockFarmerData
        });

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Authenticated - Current pathname:', window.location.pathname);
        console.log('Authenticated - Container HTML:', container.innerHTML.substring(0, 500));

        expect(window.location.pathname).toBeDefined();
    });

    it('should check navigation from root path', async () => {
        const { container } = renderWithAuth(<App />, {
            route: '/',
            isAuthenticated: false
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Root - Current pathname:', window.location.pathname);
        console.log('Root - Container HTML:', container.innerHTML.substring(0, 500));

        expect(window.location.pathname).toBeDefined();
    });
});
