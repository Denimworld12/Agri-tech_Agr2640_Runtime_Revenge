import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AuthFlow from "./AuthFlow";
import PostLoginPasskeySetup from "./PostLoginPasskeySetup";

const AuthContainer = ({ initialStep }) => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showPasskeySetup, setShowPasskeySetup] = useState(false);
    const [justLoggedIn, setJustLoggedIn] = useState(false);

    // Redirect if already logged in (and not currently setting up passkey)
    if (isAuthenticated && !justLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLoginSuccess = async (authData) => {
        // 1. Update Auth Context
        await login(authData);

        // 2. Check for Passkey Setup Logic (Ported from AuthWrapper)
        const isPasswordLogin = !authData.farmer_data?.auth_method?.includes("passkey");

        if (isPasswordLogin) {
            try {
                const token = authData.access_token;
                const passkeysResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/passkey/list`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (passkeysResponse.ok) {
                    const passkeysData = await passkeysResponse.json();
                    const hasExistingPasskey =
                        passkeysData.passkeys && passkeysData.passkeys.length > 0;

                    if (!hasExistingPasskey) {
                        // Show setup UI
                        setJustLoggedIn(true);
                        setShowPasskeySetup(true);
                        return;
                    }
                }
            } catch (error) {
                console.error("Failed to check existing passkeys:", error);
            }
        }

        // 3. Navigate to Dashboard if no passkey setup needed
        navigate("/dashboard");
    };

    const handlePasskeySetupComplete = () => {
        setShowPasskeySetup(false);
        setJustLoggedIn(false);
        navigate("/dashboard");
    };

    const handleSkipPasskeySetup = () => {
        setShowPasskeySetup(false);
        setJustLoggedIn(false);
        navigate("/dashboard");
    };

    if (showPasskeySetup) {
        return (
            <PostLoginPasskeySetup
                onSetupComplete={handlePasskeySetupComplete}
                onSkip={handleSkipPasskeySetup}
            />
        );
    }

    return (
        <AuthFlow
            initialStep={initialStep}
            onAuthSuccess={handleLoginSuccess}
        />
    );
};

export default AuthContainer;
