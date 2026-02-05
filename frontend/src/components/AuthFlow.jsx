import React, { useState, useEffect } from "react";
import LanguageSelection from "./LanguageSelection";
import AuthChoice from "./AuthChoice";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";
import PasskeyLoginWithPhone from "./PasskeyLoginWithPhone";

const AuthFlow = ({ onAuthSuccess, initialStep }) => {
  const [currentStep, setCurrentStep] = useState(initialStep || "language"); // language, choice, signup, login, passkey
  const [selectedLanguage, setSelectedLanguage] = useState("");

  useEffect(() => {
    // Only auto-set if no initialStep is provided (default behavior)
    if (!initialStep) {
      const storedLanguage = localStorage.getItem("preferredLanguage");
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
        setCurrentStep("choice");
      }
    } else if (initialStep === "login" || initialStep === "signup") {
      // If direct link to login/signup, ensure language is set if possible, otherwise default to en
      const storedLanguage = localStorage.getItem("preferredLanguage") || "en";
      setSelectedLanguage(storedLanguage);
    }
  }, [initialStep]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setCurrentStep("choice");
  };

  const handleAuthChoice = (choice) => {
    if (choice === "signup") {
      setCurrentStep("signup");
    } else if (choice === "login") {
      setCurrentStep("login");
    } else if (choice === "passkey") {
      setCurrentStep("passkey");
    } else if (choice === "language") {
      setCurrentStep("language");
    }
  };

  const handleChangeLanguage = () => {
    setCurrentStep("language");
  };

  const handleBackToChoice = () => {
    setCurrentStep("choice");
  };

  const handleSignupComplete = (data) => {
    console.log("Signup complete:", data);
    onAuthSuccess(data);
  };

  const handleLoginSuccess = (data) => {
    console.log("Login success:", data);
    onAuthSuccess(data);
  };

  const handlePasskeySuccess = (data) => {
    console.log("Passkey login success:", data);
    onAuthSuccess(data);
  };

  return (
    <>
      {currentStep === "language" && (
        <LanguageSelection onLanguageSelect={handleLanguageSelect} />
      )}

      {currentStep === "choice" && (
        <AuthChoice
          language={selectedLanguage}
          onChoice={handleAuthChoice}
          onChangeLanguage={handleChangeLanguage}
        />
      )}

      {currentStep === "signup" && (
        <SignupForm
          language={selectedLanguage}
          onSignupComplete={handleSignupComplete}
          onBack={handleBackToChoice}
        />
      )}

      {currentStep === "login" && (
        <LoginForm
          language={selectedLanguage}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setCurrentStep("signup")}
          onPasskeyLogin={() => setCurrentStep("passkey")}
          onBackToChoice={handleBackToChoice}
        />
      )}

      {currentStep === "passkey" && (
        <PasskeyLoginWithPhone
          language={selectedLanguage}
          onPasskeyLogin={handlePasskeySuccess}
          onBack={handleBackToChoice}
        />
      )}
    </>
  );
};

export default AuthFlow;
