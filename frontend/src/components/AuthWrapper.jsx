import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import AuthFlow from "./AuthFlow";
import PostLoginPasskeySetup from "./PostLoginPasskeySetup";

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, farmerData, loading, login, logout } = useAuth();
  const [showPasskeySetup, setShowPasskeySetup] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const handleLogin = async (authData) => {
    // Use AuthContext login
    await login(authData);

    // Check if this was a password login (not passkey login)
    const isPasswordLogin =
      !authData.farmer_data?.auth_method?.includes("passkey");

    if (isPasswordLogin) {
      // Check if user already has a passkey
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
            // Show passkey setup for new password logins
            setJustLoggedIn(true);
            setShowPasskeySetup(true);
            return; // Passkey setup will be shown
          }
        }
      } catch (error) {
        console.error("Failed to check existing passkeys:", error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setShowPasskeySetup(false);
    setJustLoggedIn(false);
  };

  const handlePasskeySetupComplete = () => {
    setShowPasskeySetup(false);
    setJustLoggedIn(false);
  };

  const handleSkipPasskeySetup = () => {
    setShowPasskeySetup(false);
    setJustLoggedIn(false);
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7FEE7] via-[#ECFCCB] to-[#FEF9C3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#65A30D] mx-auto mb-4"></div>
          <p className="text-[#14532D] text-lg font-semibold">Loading Agriti...</p>
        </div>
      </div>
    );
  }

  // Show passkey setup after successful password login
  if (showPasskeySetup && justLoggedIn) {
    return (
      <PostLoginPasskeySetup
        onSetupComplete={handlePasskeySetupComplete}
        onSkip={handleSkipPasskeySetup}
      />
    );
  }

  // Show authentication if not logged in
  if (!isAuthenticated) {
    return <AuthFlow onAuthSuccess={handleLogin} />;
  }

  // Show main app with farmer context
  return React.cloneElement(children, {
    farmerData,
    onLogout: handleLogout,
    isAuthenticated: true,
  });
};

export default AuthWrapper;
