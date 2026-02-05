import React from "react";
import Layout from "./components/Layout";
import AuthWrapper from "./components/AuthWrapper";
import AuthTest from "./components/AuthTest";
import { AuthProvider } from "./components/AuthContext";

function App() {
  // Check if we're in test mode (you can toggle this for testing)
  if (window.location.pathname === "/auth-test") {
    return <AuthTest />;
  }

  return (
    <AuthProvider>
      <div data-theme="lemonade" className="min-h-screen bg-base-200">
        <AuthWrapper>
          <Layout />
        </AuthWrapper>
      </div>
    </AuthProvider>
  );
}

export default App;
