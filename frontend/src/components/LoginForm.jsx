import React, { useState } from "react";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import { loginUser } from "../services/api";

const LoginForm = ({
  onLoginSuccess,
  language,
  onSwitchToSignup,
  onPasskeyLogin,
  onBackToChoice,
}) => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Multi-language translations
  const translations = {
    english: {
      title: "Login to Your Account",
      phone: "Phone Number",
      phonePlaceholder: "Enter your phone number",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      loginButton: "Login",
      noAccount: "Don't have an account?",
      signUpNow: "Sign up now",
      loginWithPasskey: "Login with Passkey",
      backToChoice: "Back to Options",
      errors: {
        phoneRequired: "Phone number is required",
        invalidPhone: "Please enter a valid 10-digit phone number",
        passwordRequired: "Password is required",
        invalidCredentials: "Invalid phone number or password",
      },
    },
    malayalam: {
      title: "നിങ്ങളുടെ അക്കൗണ്ടിൽ ലോഗിൻ ചെയ്യുക",
      phone: "ഫോൺ നമ്പർ",
      phonePlaceholder: "നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക",
      password: "പാസ്‌വേഡ്",
      passwordPlaceholder: "നിങ്ങളുടെ പാസ്‌വേഡ് നൽകുക",
      loginButton: "ലോഗിൻ",
      noAccount: "അക്കൗണ്ട് ഇല്ലേ?",
      signUpNow: "ഇപ്പോൾ സൈൻ അപ്പ് ചെയ്യുക",
      loginWithPasskey: "പാസ്‌കീ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക",
      backToChoice: "ഓപ്ഷനുകളിലേക്ക് മടങ്ങുക",
      errors: {
        phoneRequired: "ഫോൺ നമ്പർ ആവശ്യമാണ്",
        invalidPhone: "സാധുവായ 10 അക്ക ഫോൺ നമ്പർ നൽകുക",
        passwordRequired: "പാസ്‌വേഡ് ആവശ്യമാണ്",
        invalidCredentials: "തെറ്റായ ഫോൺ നമ്പർ അല്ലെങ്കിൽ പാസ്‌വേഡ്",
      },
    },
    hindi: {
      title: "अपने खाते में लॉगिन करें",
      phone: "फ़ोन नंबर",
      phonePlaceholder: "अपना फ़ोन नंबर दर्ज करें",
      password: "पासवर्ड",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      loginButton: "लॉगिन",
      noAccount: "कोई खाता नहीं है?",
      signUpNow: "अभी साइन अप करें",
      loginWithPasskey: "पासकी के साथ लॉगिन करें",
      backToChoice: "विकल्पों पर वापस जाएं",
      errors: {
        phoneRequired: "फ़ोन नंबर आवश्यक है",
        invalidPhone: "कृपया एक वैध 10 अंकों का फ़ोन नंबर दर्ज करें",
        passwordRequired: "पासवर्ड आवश्यक है",
        invalidCredentials: "अमान्य फ़ोन नंबर या पासवर्ड",
      },
    },
    tamil: {
      title: "உங்கள் கணக்கில் உள்நுழையவும்",
      phone: "தொலைபேசி எண்",
      phonePlaceholder: "உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்",
      password: "கடவுச்சொல்",
      passwordPlaceholder: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
      loginButton: "உள்நுழை",
      noAccount: "கணக்கு இல்லையா?",
      signUpNow: "இப்போது பதிவு செய்யுங்கள்",
      loginWithPasskey: "பாஸ்கீ மூலம் உள்நுழையவும்",
      backToChoice: "விருப்பங்களுக்கு திரும்பு",
      errors: {
        phoneRequired: "தொலைபேசி எண் தேவை",
        invalidPhone: "செல்லுபடியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்",
        passwordRequired: "கடவுச்சொல் தேவை",
        invalidCredentials: "தவறான தொலைபேசி எண் அல்லது கடவுச்சொல்",
      },
    },
    telugu: {
      title: "మీ ఖాతాలోకి లాగిన్ చేయండి",
      phone: "ఫోన్ నంబర్",
      phonePlaceholder: "మీ ఫోన్ నంబర్‌ను నమోదు చేయండి",
      password: "పాస్‌వర్డ్",
      passwordPlaceholder: "మీ పాస్‌వర్డ్‌ను నమోదు చేయండి",
      loginButton: "లాగిన్",
      noAccount: "ఖాతా లేదా?",
      signUpNow: "ఇప్పుడు సైన్ అప్ చేయండి",
      loginWithPasskey: "పాస్‌కీతో లాగిన్ చేయండి",
      backToChoice: "ఎంపికలకు తిరిగి వెళ్లండి",
      errors: {
        phoneRequired: "ఫోన్ నంబర్ అవసరం",
        invalidPhone:
          "దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల ఫోన్ నంబర్‌ను నమోదు చేయండి",
        passwordRequired: "పాస్‌వర్డ్ అవసరం",
        invalidCredentials: "చెల్లని ఫోన్ నంబర్ లేదా పాస్‌వర్డ్",
      },
    },
    kannada: {
      title: "ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
      phone: "ಫೋನ್ ಸಂಖ್ಯೆ",
      phonePlaceholder: "ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
      password: "ಪಾಸ್‌ವರ್ಡ್",
      passwordPlaceholder: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ನಮೂದಿಸಿ",
      loginButton: "ಲಾಗಿನ್",
      noAccount: "ಖಾತೆ ಇಲ್ಲವೇ?",
      signUpNow: "ಈಗಲೇ ಸೈನ್ ಅಪ್ ಮಾಡಿ",
      loginWithPasskey: "ಪಾಸ್‌ಕೀ ಬಳಸಿ ಲಾಗಿನ್ ಮಾಡಿ",
      backToChoice: "ಆಯ್ಕೆಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
      errors: {
        phoneRequired: "ಫೋನ್ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿದೆ",
        invalidPhone: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಗಳ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
        passwordRequired: "ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿದೆ",
        invalidCredentials: "ಅಮಾನ್ಯ ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್",
      },
    },
  };

  const t = translations[language] || translations.english;

  // Phone number validation
  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    return phoneRegex.test(phone);
  };

  // Input validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = t.errors.phoneRequired;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t.errors.invalidPhone;
    }

    if (!formData.password.trim()) {
      newErrors.password = t.errors.passwordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = await loginUser({
        phone: formData.phone,
        password: formData.password,
      });

      // Store user data in localStorage
      localStorage.setItem("farmerData", JSON.stringify(userData.farmer_data));
      localStorage.setItem("authToken", userData.access_token);

      onLoginSuccess(userData);
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: error.message || t.errors.invalidCredentials,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle passkey login
  const handlePasskeyLogin = () => {
    if (onPasskeyLogin) {
      onPasskeyLogin();
    }
  };

  return (
    <div data-theme="lemonade" className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
              <span className="material-symbols-outlined text-4xl text-primary">
                lock_open
              </span>
            </div>
            <h2 className="text-2xl font-black text-base-content leading-tight">
              {t.title}
            </h2>
          </div>

          {/* General Error Alert */}
          {errors.general && (
            <div className="alert alert-error shadow-sm mb-6 py-2 text-sm rounded-lg">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number Field */}
            <div className="form-control">
              <label className="label py-1" htmlFor="phone">
                <span className="label-text font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">call</span>
                  {t.phone}
                </span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.phonePlaceholder}
                  maxLength="10"
                  className={`input input-bordered w-full h-12 ${errors.phone ? "input-error" : ""}`}
                />
              </div>
              {errors.phone && (
                <label className="label py-0 mt-1">
                  <span className="label-text-alt text-error font-medium">{errors.phone}</span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label py-1" htmlFor="password">
                <span className="label-text font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">key</span>
                  {t.password}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.passwordPlaceholder}
                  className={`input input-bordered w-full h-12 pr-12 ${errors.password ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <label className="label py-0 mt-1">
                  <span className="label-text-alt text-error font-medium">{errors.password}</span>
                </label>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full h-12 text-lg font-bold shadow-md"
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  {t.loginButton}
                </>
              )}
            </button>
          </form>

          {/* Alternative Login Options */}
          <div className="mt-8 space-y-3">
            <div className="divider text-[10px] uppercase font-bold opacity-30">Other Methods</div>
            
            <button
              onClick={handlePasskeyLogin}
              className="btn btn-outline btn-secondary w-full h-12 gap-3"
            >
              <span className="material-symbols-outlined">passkey</span>
              {t.loginWithPasskey}
            </button>

            {onBackToChoice && (
              <button
                onClick={onBackToChoice}
                className="btn btn-ghost btn-sm w-full opacity-60 hover:opacity-100"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                {t.backToChoice}
              </button>
            )}
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center pt-6 border-t border-base-200">
            <p className="text-sm opacity-70">
              {t.noAccount}{" "}
              <button
                onClick={onSwitchToSignup}
                className="font-bold text-primary hover:link"
              >
                {t.signUpNow}
              </button>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
