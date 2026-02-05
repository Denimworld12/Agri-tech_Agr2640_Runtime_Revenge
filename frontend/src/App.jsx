import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AuthWrapper from "./components/AuthWrapper";
import AuthTest from "./components/AuthTest";
import AuthContainer from "./components/AuthContainer";
import Dashboard from "./components/Dashboard";
import CropPrediction from "./components/CropPrediction";
import Schemes from "./components/Schemes";
import MarketPrices from "./components/MarketPrices";
import WeatherForecast from "./components/WeatherForecast";
import DiseaseDetector from "./components/DiseaseDetector";
import InventoryManagement from "./components/InventoryManagement";
import Settings from "./components/Settings";
import { AuthProvider } from "./components/AuthContext";

function App() {
  // Check if we're in test mode (you can toggle this for testing)


  return (
    <AuthProvider>
      <div data-theme="lemonade" className="min-h-screen bg-base-200">
        <Routes>
          {/* Public Routes */}
          {/* Public Routes */}
          <Route path="/login" element={<AuthContainer initialStep="login" />} />
          <Route path="/signup" element={<AuthContainer initialStep="signup" />} />
          <Route path="/auth" element={<AuthContainer />} />
          <Route path="/auth-test" element={<AuthTest />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <AuthWrapper>
                <Layout />
              </AuthWrapper>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="crops" element={<CropPrediction />} />
            <Route path="reports" element={<Schemes />} />
            <Route path="analytics" element={<MarketPrices />} />
            <Route path="weather" element={<WeatherForecast />} />
            <Route path="disease-detector" element={<DiseaseDetector />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
