import React, { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

const PostLoginPasskeySetup = ({
  onSetupComplete,
  onSkip,
  language = "en",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const translations = {
    en: {
      title: "Setup Secure Login",
      subtitle: "Create a passkey for faster, secure access",
      benefits: [
        "🚀 Lightning fast login",
        "🔐 No passwords to remember",
        "🛡️ Military-grade security",
        "📱 Use Touch/Face ID",
      ],
      setupNow: "Setup Passkey Now",
      skipForNow: "Skip for Now",
      setting: "Setting up passkey...",
      successTitle: "Passkey Created Successfully!",
      successMessage: "You can now login using biometric authentication",
      continue: "Continue to App",
      errorTitle: "Setup Failed",
      tryAgain: "Try Again",
    },
    hi: {
      title: "सुरक्षित लॉगिन सेटअप करें",
      subtitle: "तेज़ और सुरक्षित पहुंच के लिए पासकी बनाएं",
      benefits: [
        "🚀 बिजली की तरह तेज़ लॉगिन",
        "🔐 पासवर्ड याद रखने की जरूरत नहीं",
        "🛡️ सैन्य-ग्रेड सुरक्षा",
        "📱 Touch/Face ID का उपयोग करें",
      ],
      setupNow: "अभी पासकी सेटअप करें",
      skipForNow: "अभी के लिए छोड़ें",
      setting: "पासकी सेटअप की जा रही है...",
      successTitle: "पासकी सफलतापूर्वक बनाई गई!",
      successMessage:
        "अब आप बायोमेट्रिक प्रमाणीकरण का उपयोग करके लॉगिन कर सकते हैं",
      continue: "ऐप पर जारी रखें",
      errorTitle: "सेटअप असफल",
      tryAgain: "पुनः प्रयास करें",
    },
  };

  const t = translations[language] || translations.en;

  // Convert ArrayBuffer to base64 (URL-safe, no padding)
  const arrayBufferToBase64 = (buffer) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  };

  // Convert base64 to ArrayBuffer (handles both regular and URL-safe base64)
  const base64ToArrayBuffer = (base64) => {
    try {
      // Convert URL-safe base64 to regular base64
      let regularBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding if needed
      while (regularBase64.length % 4) {
        regularBase64 += "=";
      }
      const binaryString = atob(regularBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (error) {
      console.error("❌ Error decoding base64:", error);
      throw new Error(`Invalid base64 string: ${error.message}`);
    }
  };

  const setupPasskey = async () => {
    setLoading(true);
    setError("");

    try {
      // Check WebAuthn support
      if (!window.PublicKeyCredential || !navigator.credentials) {
        throw new Error("Passkeys are not supported on this device/browser");
      }

      // Generate challenge from server
      const challengeResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/passkey/challenge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const challengeData = await challengeResponse.json();
      if (!challengeResponse.ok) {
        throw new Error(challengeData.detail || "Failed to get challenge");
      }

      const challenge = base64ToArrayBuffer(challengeData.challenge);

      // Get current farmer data for userId
      const farmerData = JSON.parse(localStorage.getItem("farmerData") || "{}");
      const userIdString = farmerData.farmer_id || "farmer_" + Date.now();
      const userId = new TextEncoder().encode(userIdString);

      const createOptions = {
        publicKey: {
          challenge: challenge,
          rp: {
            name: "Agriti",
            id: "localhost", // In production, use your domain
          },
          user: {
            id: userId,
            name: farmerData.phone || "farmer@krishisaathi.com",
            displayName: farmerData.name || "Agriti Farmer",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred",
            requireResidentKey: false,
          },
          timeout: 60000,
        },
      };

      console.log("🔐 Creating passkey with options:", createOptions);

      const credential = await navigator.credentials.create(createOptions);

      if (credential) {
        // Prepare registration data
        const registrationData = {
          credentialId: arrayBufferToBase64(credential.rawId),
          publicKey: arrayBufferToBase64(credential.response.publicKey),
          challenge: challengeData.challenge,
          userId: arrayBufferToBase64(userId),
        };

        console.log("✅ Passkey created, registering with server...");

        // Register with server
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/passkey/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(registrationData),
          }
        );

        const data = await response.json();

        if (response.ok) {
          console.log("✅ Passkey registered successfully");
          setSuccess(true);
        } else {
          throw new Error(data.detail || "Failed to register passkey");
        }
      }
    } catch (error) {
      console.error("❌ Passkey setup error:", error);
      if (error.name === "NotAllowedError") {
        setError("Passkey creation was cancelled or not allowed");
      } else if (error.name === "NotSupportedError") {
        setError("Passkeys are not supported on this device");
      } else {
        setError(`Setup failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div data-theme="lemonade" className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6 mx-auto">
              <span className="material-symbols-outlined text-6xl text-success">
                check_circle
              </span>
            </div>
            <h2 className="text-2xl font-black text-success mb-2">
              {t.successTitle}
            </h2>
            <p className="text-base-content/70 mb-8">{t.successMessage}</p>
            <button
              onClick={onSetupComplete}
              className="btn btn-primary w-full h-14 text-lg font-bold"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
              {t.continue}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="lemonade" className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-6 sm:p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <span className="material-symbols-outlined text-4xl text-primary font-bold">
                fingerprint
              </span>
            </div>
            <h2 className="text-2xl font-black text-base-content leading-tight">
              {t.title}
            </h2>
            <p className="text-xs opacity-60 mt-2">{t.subtitle}</p>
          </div>

          {/* Benefits Container - Single Div for Professionalism */}
          <div className="bg-base-200/50 border border-base-300 rounded-2xl p-4 mb-8 space-y-4">
            {t.benefits.map((benefit, index) => {
              const icons = ["speed", "verified_user", "devices"];
              return (
                <div key={index} className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary font-bold">
                    {icons[index] || "check"}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-base-content/80 leading-snug">
                      {benefit.substring(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-error shadow-sm mb-6 py-3 text-sm rounded-xl">
              <span className="material-symbols-outlined">report</span>
              <div className="text-left">
                <p className="font-bold">{t.errorTitle}</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={setupPasskey}
              disabled={loading}
              className="btn btn-primary w-full h-14 text-lg font-bold shadow-md"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined">passkey</span>
                  {t.setupNow}
                </>
              )}
            </button>

            <button
              onClick={onSkip}
              className="btn btn-ghost w-full font-bold opacity-60 hover:opacity-100 h-12"
              disabled={loading}
            >
              {t.skipForNow}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-20">
              Secure Agriculture Portal
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostLoginPasskeySetup;
