import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';

/**
 * Custom render function that wraps components with necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.authValue - Mock auth context value
 * @param {boolean} options.isAuthenticated - Whether user is authenticated
 * @param {Object} options.farmerData - Mock farmer data
 * @returns {Object} - Render result with additional utilities
 */
export function renderWithRouter(ui, options = {}) {
    const {
        route = '/',
        ...renderOptions
    } = options;

    window.history.pushState({}, 'Test page', route);

    return render(
        <BrowserRouter>
            {ui}
        </BrowserRouter>,
        renderOptions
    );
}

/**
 * Render component with Router and AuthProvider
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {boolean} options.isAuthenticated - Whether user is authenticated
 * @param {Object} options.farmerData - Mock farmer data
 * @param {string} options.route - Initial route
 * @returns {Object} - Render result
 */
export function renderWithAuth(ui, options = {}) {
    const {
        isAuthenticated = false,
        farmerData = null,
        route = '/',
        ...renderOptions
    } = options;

    // Mock localStorage for auth
    if (isAuthenticated && farmerData) {
        localStorage.setItem('access_token', 'mock-token');
        localStorage.setItem('refresh_token', 'mock-refresh-token');
        localStorage.setItem('farmer_data', JSON.stringify(farmerData));
    } else {
        localStorage.clear();
    }

    window.history.pushState({}, 'Test page', route);

    return render(
        <BrowserRouter>
            <AuthProvider>
                {ui}
            </AuthProvider>
        </BrowserRouter>,
        renderOptions
    );
}

/**
 * Mock farmer data for testing
 */
export const mockFarmerData = {
    id: 1,
    name: 'Test Farmer',
    phone: '+911234567890',
    email: 'test@farmer.com',
    location: {
        latitude: 19.0760,
        longitude: 72.8777,
    },
    auth_method: 'password',
};

/**
 * Mock authenticated farmer data with passkey
 */
export const mockFarmerDataWithPasskey = {
    ...mockFarmerData,
    auth_method: 'passkey',
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
