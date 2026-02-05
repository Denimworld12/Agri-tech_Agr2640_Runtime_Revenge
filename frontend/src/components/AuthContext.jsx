import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [farmerData, setFarmerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionValidatedAt, setSessionValidatedAt] = useState(null);

    const SESSION_VALID_DURATION = 5 * 60 * 1000; // 5 minutes

    // Check if session was recently validated
    const isSessionValid = useCallback(() => {
        if (!sessionValidatedAt) return false;
        return Date.now() - sessionValidatedAt < SESSION_VALID_DURATION;
    }, [sessionValidatedAt, SESSION_VALID_DURATION]);

    // Validate token with backend
    const validateToken = useCallback(async (token, retryCount = 0) => {
        const MAX_RETRIES = 2;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const profileData = await response.json();
                setFarmerData(profileData);
                setIsAuthenticated(true);
                setSessionValidatedAt(Date.now());
                localStorage.setItem("farmerData", JSON.stringify(profileData));
                localStorage.setItem("sessionValidatedAt", Date.now().toString());
                return { success: true, data: profileData };
            } else if (response.status === 401) {
                // Unauthorized - invalid token
                return { success: false, error: "invalid_token" };
            } else {
                // Other error - might be temporary
                return { success: false, error: "server_error" };
            }
        } catch (error) {
            console.error("Token validation error:", error);

            // Retry on network errors
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying token validation... (${retryCount + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                return validateToken(token, retryCount + 1);
            }

            return { success: false, error: "network_error" };
        }
    }, []);

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("authToken");
            const storedFarmerData = localStorage.getItem("farmerData");
            const storedValidatedAt = localStorage.getItem("sessionValidatedAt");

            if (!token) {
                setLoading(false);
                return;
            }

            // Optimistically restore session from localStorage
            if (storedFarmerData) {
                try {
                    const parsedData = JSON.parse(storedFarmerData);
                    setFarmerData(parsedData);
                    setIsAuthenticated(true);
                    if (storedValidatedAt) {
                        setSessionValidatedAt(parseInt(storedValidatedAt, 10));
                    }
                } catch (error) {
                    console.error("Failed to parse stored farmer data:", error);
                }
            }

            // If session was recently validated, skip backend check
            if (storedValidatedAt) {
                const lastValidated = parseInt(storedValidatedAt, 10);
                if (Date.now() - lastValidated < SESSION_VALID_DURATION) {
                    console.log("✅ Using cached session (recently validated)");
                    setLoading(false);
                    return;
                }
            }

            // Validate token with backend
            console.log("🔄 Validating token with backend...");
            const result = await validateToken(token);

            if (!result.success) {
                if (result.error === "invalid_token") {
                    // Clear session only if token is truly invalid
                    console.log("❌ Token invalid, clearing session");
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("farmerData");
                    localStorage.removeItem("sessionValidatedAt");
                    setIsAuthenticated(false);
                    setFarmerData(null);
                } else {
                    // Network or server error - keep session active with cached data
                    console.log("⚠️ Validation failed but keeping cached session");
                }
            } else {
                console.log("✅ Token validated successfully");
            }

            setLoading(false);
        };

        checkAuth();
    }, [validateToken, SESSION_VALID_DURATION]);

    // Login function
    const login = useCallback(async (authData) => {
        // Save the token and initial data
        localStorage.setItem("authToken", authData.access_token);
        localStorage.setItem("farmerData", JSON.stringify(authData.farmer_data));
        localStorage.setItem("sessionValidatedAt", Date.now().toString());

        // Set state
        setFarmerData(authData.farmer_data);
        setIsAuthenticated(true);
        setSessionValidatedAt(Date.now());

        // Fetch the latest profile data from backend
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${authData.access_token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const latestProfileData = await response.json();
                setFarmerData(latestProfileData);
                localStorage.setItem("farmerData", JSON.stringify(latestProfileData));
                console.log("✅ Fresh farmer data loaded:", latestProfileData);
            }
        } catch (error) {
            console.error("❌ Failed to fetch latest profile:", error);
            // Continue with cached data
        }

        return authData;
    }, []);

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("farmerData");
        localStorage.removeItem("sessionValidatedAt");
        setIsAuthenticated(false);
        setFarmerData(null);
        setSessionValidatedAt(null);
        console.log("👋 Logged out successfully");
    }, []);

    // Refresh farmer data
    const refreshFarmerData = useCallback(async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const result = await validateToken(token);
        if (result.success) {
            return result.data;
        }
        return null;
    }, [validateToken]);

    const value = {
        isAuthenticated,
        farmerData,
        loading,
        login,
        logout,
        refreshFarmerData,
        isSessionValid,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
