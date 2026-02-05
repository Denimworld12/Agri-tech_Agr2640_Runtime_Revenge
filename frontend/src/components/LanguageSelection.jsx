import React from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

const LanguageSelection = ({ onLanguageSelect }) => {
  const languages = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "Eng",
      greeting: "Welcome",
    },
    {
      code: "hi",
      name: "Hindi",
      nativeName: "हिंदी",
      flag: "ॐ",
      greeting: "स्वागत है",
    },
    {
      code: "ml",
      name: "Malayalam",
      nativeName: "മലയാളം",
      flag: "അ",
      greeting: "സ്വാഗതം",
    },
    {
      code: "ta",
      name: "Tamil",
      nativeName: "தமிழ்",
      flag: "அ",
      greeting: "வரவேற்கிறோம்",
    },
    {
      code: "te",
      name: "Telugu",
      nativeName: "తెలుగు",
      flag: "క",
      greeting: "స్వాగతం",
    },
    {
      code: "kn",
      name: "Kannada",
      nativeName: "ಕನ್ನಡ",
      flag: "ಕ",
      greeting: "ಸ್ವಾಗತ",
    },
  ];

  const handleLanguageSelect = (language) => {
    // Save language preference
    localStorage.setItem("preferredLanguage", language.code);
    onLanguageSelect(language.code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FEE7] via-[#ECFCCB] to-[#FEF9C3] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-6 md:p-8 rounded-xl bg-white border border-[#D9F99D] shadow-md">

        {/* App Logo/Icon */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌾</div>
          <h1 className="text-2xl font-semibold text-[#14532D] mb-1">
            Agriti
          </h1>
          <p className="text-[#4D7C0F] text-sm md:text-base">
            Select Your Language / अपनी भाषा चुनें
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {languages.map((language) => (
            <Button
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2
          bg-[#F7FEE7] border border-[#D9F99D]
          hover:bg-[#ECFDF5] hover:border-[#65C18C]
          transition-all rounded-lg"
            >
              {/* <span className="text-4xl text-[#166534]">
            {language.flag}
          </span> */}
              <div className="text-center">
                <p className="text-lg font-semibold text-[#14532D]">
                  {language.nativeName}
                </p>
                <p className="text-xs text-[#4D7C0F]">
                  {language.name}
                </p>
                <p className="text-sm text-[#15803D] mt-1 font-medium">
                  {language.greeting}
                </p>
              </div>
            </Button>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#4D7C0F]">
            Choose your preferred language to continue
          </p>
          <p className="text-[11px] text-[#65A30D] mt-0.5">
            आगे बढ़ने के लिए अपनी पसंदीदा भाषा चुनें
          </p>
        </div>

      </Card>
    </div>

  );
};

export default LanguageSelection;
