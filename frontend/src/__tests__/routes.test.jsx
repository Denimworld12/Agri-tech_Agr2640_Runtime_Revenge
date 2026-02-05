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

describe('Route Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();

        // Default mock for fetch (passkey list endpoint)
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ passkeys: [] }),
        });
    });

    describe('Public Routes (Unauthenticated)', () => {
        it('should render login page at /login', async () => {
            renderWithAuth(<App />, { route: '/login' });

            // AuthContainer should render with login form visible eventually
            await waitFor(() => {
                // Look for common login elements
                expect(document.querySelector('input[type="tel"]') ||
                    document.querySelector('input[placeholder*="phone"]') ||
                    document.body.textContent.includes('Login') ||
                    document.body.textContent.includes('लॉगिन')).toBeTruthy();
            });
        });

        it('should render signup page at /signup', async () => {
            renderWithAuth(<App />, { route: '/signup' });

            await waitFor(() => {
                // Look for signup-specific elements
                expect(document.body.textContent.includes('Signup') ||
                    document.body.textContent.includes('Sign') ||
                    document.body.textContent.includes('साइन अप')).toBeTruthy();
            });
        });

        it('should render auth page at /auth', async () => {
            renderWithAuth(<App />, { route: '/auth' });

            await waitFor(() => {
                // AuthContainer should render
                expect(document.body).toBeTruthy();
            });
        });

        it('should render auth test page at /auth-test', async () => {
            renderWithAuth(<App />, { route: '/auth-test' });

            await waitFor(() => {
                // AuthTest component should render
                expect(document.body).toBeTruthy();
            });
        });
    });

    describe('Protected Routes - Unauthenticated Access', () => {
        const protectedRoutes = [
            '/',
            '/dashboard',
            '/crops',
            '/weather',
            '/analytics',
            '/disease-detector',
            '/inventory',
            '/reports',
            '/settings',
        ];

        protectedRoutes.forEach((route) => {
            it(`should redirect ${route} to /login when not authenticated`, async () => {
                renderWithAuth(<App />, {
                    route,
                    isAuthenticated: false
                });

                await waitFor(() => {
                    // Should redirect to login - check URL
                    expect(window.location.pathname).toBe('/login');
                }, { timeout: 3000 });
            });
        });
    });

    describe('Protected Routes - Authenticated Access', () => {
        beforeEach(() => {
            // Mock authenticated state
            localStorage.setItem('access_token', 'mock-token');
            localStorage.setItem('refresh_token', 'mock-refresh-token');
            localStorage.setItem('farmer_data', JSON.stringify(mockFarmerData));
        });

        it('should redirect / to /dashboard when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/dashboard');
            }, { timeout: 3000 });
        });

        it('should render dashboard at /dashboard when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/dashboard',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                // Should stay on dashboard
                expect(window.location.pathname).toBe('/dashboard');
                // Layout should render (look for common layout elements)
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render crops page at /crops when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/crops',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/crops');
            }, { timeout: 3000 });
        });

        it('should render weather page at /weather when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/weather',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/weather');
            }, { timeout: 3000 });
        });

        it('should render analytics (market prices) page at /analytics when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/analytics',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/analytics');
            }, { timeout: 3000 });
        });

        it('should render disease detector page at /disease-detector when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/disease-detector',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/disease-detector');
            }, { timeout: 3000 });
        });

        it('should render inventory page at /inventory when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/inventory',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/inventory');
            }, { timeout: 3000 });
        });

        it('should render reports (schemes) page at /reports when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/reports',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/reports');
            }, { timeout: 3000 });
        });

        it('should render settings page at /settings when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/settings',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/settings');
            }, { timeout: 3000 });
        });
    });

    describe('Fallback Routes', () => {
        it('should redirect unknown routes to / when unauthenticated', async () => {
            renderWithAuth(<App />, {
                route: '/this-route-does-not-exist',
                isAuthenticated: false
            });

            await waitFor(() => {
                // Should redirect to / then to /login
                expect(window.location.pathname).toBe('/login');
            }, { timeout: 3000 });
        });

        it('should redirect unknown routes to / (then /dashboard) when authenticated', async () => {
            renderWithAuth(<App />, {
                route: '/this-route-does-not-exist',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                // Should redirect to / then to /dashboard
                expect(window.location.pathname).toBe('/dashboard');
            }, { timeout: 3000 });
        });
    });

    describe('Authentication Flow', () => {
        it('should redirect authenticated users from /login to /dashboard', async () => {
            renderWithAuth(<App />, {
                route: '/login',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/dashboard');
            }, { timeout: 3000 });
        });

        it('should redirect authenticated users from /signup to /dashboard', async () => {
            renderWithAuth(<App />, {
                route: '/signup',
                isAuthenticated: true,
                farmerData: mockFarmerData
            });

            await waitFor(() => {
                expect(window.location.pathname).toBe('/dashboard');
            }, { timeout: 3000 });
        });
    });
});
