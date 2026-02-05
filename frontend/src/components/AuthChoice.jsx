import React from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

const AuthChoice = ({ onChoice, language = "en" }) => {
  const translations = {
    en: {
      welcome: "Welcome to Agriti",
      subtitle: "Your Agricultural Companion",
      newUser: "New User",
      newUserDesc: "Create a new account",
      existingUser: "Existing User",
      existingUserDesc: "Login to your account",
      passkeyUser: "Passkey Login",
      passkeyUserDesc: "Use biometric authentication",
      changeLanguage: "Change Language",
    },
    hi: {
      welcome: "कृषि साथी में आपका स्वागत है",
      subtitle: "आपका कृषि साथी",
      newUser: "नया उपयोगकर्ता",
      newUserDesc: "नया खाता बनाएं",
      existingUser: "मौजूदा उपयोगकर्ता",
      existingUserDesc: "अपने खाते में लॉगिन करें",
      passkeyUser: "पासकी लॉगिन",
      passkeyUserDesc: "बायोमेट्रिक प्रमाणीकरण का उपयोग करें",
      changeLanguage: "भाषा बदलें",
    },
    ml: {
      welcome: "കൃഷി സാഥിയിലേക്ക് സ്വാഗതം",
      subtitle: "നിങ്ങളുടെ കാർഷിക കൂട്ടുകാരൻ",
      newUser: "പുതിയ ഉപയോക്താവ്",
      newUserDesc: "പുതിയ അക്കൗണ്ട് സൃഷ്ടിക്കുക",
      existingUser: "നിലവിലുള്ള ഉപയോക്താവ്",
      existingUserDesc: "നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് ലോഗിൻ ചെയ്യുക",
      changeLanguage: "ഭാഷ മാറ്റുക",
    },
    ta: {
      welcome: "கிருஷி சாத்திக்கு வரவேற்கிறோம்",
      subtitle: "உங்கள் விவசாய துணை",
      newUser: "புதிய பயனர்",
      newUserDesc: "புதிய கணக்கை உருவாக்கவும்",
      existingUser: "ஏற்கனவே உள்ள பயனர்",
      existingUserDesc: "உங்கள் கணக்கில் உள்நுழைக",
      changeLanguage: "மொழியை மாற்று",
    },
    te: {
      welcome: "కృషి సాథికి స్వాగతం",
      subtitle: "మీ వ్యవసాయ సహచరుడు",
      newUser: "కొత్త వినియోగదారు",
      newUserDesc: "కొత్త ఖాతాను సృష్టించండి",
      existingUser: "ఇప్పటికే ఉన్న వినియోగదారు",
      existingUserDesc: "మీ ఖాతాలోకి లాగిన్ అవ్వండి",
      changeLanguage: "భాషను మార్చండి",
    },
    kn: {
      welcome: "ಕೃಷಿ ಸಾಥಿಗೆ ಸ್ವಾಗತ",
      subtitle: "ನಿಮ್ಮ ಕೃಷಿ ಸಹಚರ",
      newUser: "ಹೊಸ ಬಳಕೆದಾರ",
      newUserDesc: "ಹೊಸ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
      existingUser: "ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಬಳಕೆದಾರ",
      existingUserDesc: "ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
      changeLanguage: "ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ",
    },
  };

  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen flex items-center justify-center 
  bg-gradient-to-br from-[#F7FEE7] via-[#ECFCCB] to-[#FEF9C3] px-4">

      <Card className="w-full max-w-3xl rounded-2xl shadow-lg 
    border border-[#D9F99D] bg-white p-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌾</div>
          <h1 className="text-3xl font-semibold text-[#14532D]">
            {t.welcome}
          </h1>
          <p className="text-[#4D7C0F] mt-2">
            {t.subtitle}
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Signup */}
          <button
            onClick={() => onChoice("signup")}
            className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]
        p-6 text-center hover:shadow-md hover:border-[#65C18C] transition"
          >
            <span className="material-symbols-outlined text-4xl text-[#15803D] mb-4">
              app_registration
            </span>
            <h3 className="text-lg font-semibold text-[#14532D]">
              {t.newUser}
            </h3>
            <p className="text-sm text-[#4D7C0F] mt-2">
              {t.newUserDesc}
            </p>
          </button>

          {/* Login */}
          <button
            onClick={() => onChoice("login")}
            className="rounded-xl border border-[#D9F99D] bg-[#F7FEE7]
        p-6 text-center hover:shadow-md hover:border-[#84CC16] transition"
          ><span className="material-symbols-outlined text-4xl text-[#166534] mb-4">
              lock_open
            </span>

            <h3 className="text-lg font-semibold text-[#14532D]">
              {t.existingUser}
            </h3>
            <p className="text-sm text-[#4D7C0F] mt-2">
              {t.existingUserDesc}
            </p>
          </button>

          {/* Passkey */}
          <button
            onClick={() => onChoice("passkey")}
            className="rounded-xl border-2 border-[#65C18C] 
        bg-gradient-to-br from-[#ECFDF5] to-[#F7FEE7]
        p-6 text-center hover:shadow-lg transition"
          > <span className="material-symbols-outlined text-4xl text-[#65A30D] mb-4">
              key
            </span>

            <h3 className="text-lg font-semibold text-[#14532D]">
              {t.passkeyUser}
            </h3>
            <p className="text-sm text-[#4D7C0F] mt-2">
              {t.passkeyUserDesc}
            </p>
          </button>

        </div>

        {/* Language */}
        <div className="mt-10 text-center">
          <button
            onClick={() => onChoice("language")}
            className="text-sm flex items-center justify-center gap-1
        text-[#4D7C0F] hover:text-[#166534]"
          >
            <span className="material-symbols-outlined text-[#65A30D]">
              language
            </span>
            {t.changeLanguage}
          </button>
        </div>

      </Card>
    </div>

  );
};

export default AuthChoice;
