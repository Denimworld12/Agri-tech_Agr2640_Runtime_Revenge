import React, { useState, useEffect } from "react";

const AppBar = ({
  activeItem,
  toggleSidebar,
  language,
  toggleLanguage,
  farmerData,
  onLogout,
  setActiveItem,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    if (onLogout) onLogout();
    setShowLogoutConfirm(false);
  };
  const cancelLogout = () => setShowLogoutConfirm(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showLogoutConfirm) cancelLogout();
        if (showProfileDropdown) setShowProfileDropdown(false);
      }
    };
    const handleClickOutside = (e) => {
      if (showProfileDropdown && !e.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutConfirm, showProfileDropdown]);

  const getFarmerInitials = () => {
    if (!farmerData?.name) return "F";
    const names = farmerData.name.split(" ");
    return names.length >= 2
      ? (names[0][0] + names[1][0]).toUpperCase()
      : names[0].slice(0, 2).toUpperCase();
  };

  const getPageTitle = (item) => {
    const titles = {
      en: { dashboard: "Agriti", crops: "Crop Prediction", weather: "Weather Forecast", analytics: "Market Prices", "disease-detector": "Disease Detector", chatbot: "AgriBot Assistant", irrigation: "Irrigation", livestock: "Livestock Management", inventory: "Inventory Management", reports: "Schemes", settings: "Settings" },
      hi: { dashboard: "डैशबोर्ड", crops: "फसल भविष्यवाणी", weather: "मौसम पूर्वानुमान", analytics: "बाजार भाव", "disease-detector": "रोग डिटेक्टर", chatbot: "कृषि सहायक", irrigation: "सिंचाई", livestock: "पशुधन प्रबंधन", inventory: "इन्वेंट्री प्रबंधन", reports: "योजनाएं", settings: "सेटिंग्स" },
      ml: { dashboard: "ഡാഷ്ബോർഡ്", crops: "വിള പ്രവചനം", weather: "കാലാവസ്ഥ പ്രവചനം", analytics: "വിപണി വിലകൾ", "disease-detector": "രോഗ നിർണയം", chatbot: "കൃഷി സഹായി", irrigation: "ജലസേചനം", livestock: "കന്നുകാലി പരിപാലനം", inventory: "ഇൻവെന്ററി മാനേജ്മെന്റ്", reports: "പദ്ധതികൾ", settings: "ക്രമീകരണങ്ങൾ" },
    };
    return titles[language]?.[item] || "AgriDash";
  };

  const getPageIcon = (item) => {
    const icons = {
      dashboard: "",
      crops: "agriculture",
      weather: "wb_sunny",
      analytics: "trending_up",
      "disease-detector": "biotech",
      chatbot: "smart_toy",
      irrigation: "water_drop",
      livestock: "pets",
      inventory: "inventory_2",
      reports: "verified",
      settings: "settings",
    };
    return icons[item] || "potted_plant";
  };

  return (
    <div data-theme="lemonade" className="bg-base-100 border-b border-base-300 px-4 md:px-6 py-3 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* <button
            onClick={toggleSidebar}
            className="btn btn-ghost btn-circle"
          >
            <span className="material-symbols-outlined">menu</span>
          </button> */}

          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">{getPageIcon(activeItem)}</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-base-content leading-tight">
                {getPageTitle(activeItem)}
              </h1>
              <p className="hidden lg:flex text-[10px] uppercase font-bold tracking-wider opacity-50">
                {language === "ml" ? "കൈകാര്യം ചെയ്യുക" : language === "hi" ? "प्रबंधन करें" : "Management Portal"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="btn btn-sm btn-outline border-base-300 gap-2 normal-case"
          >
            <span className="material-symbols-outlined text-sm text-primary">translate</span>
            <span className="text-xs font-bold">
              {language === "en" ? "हिंदी" : language === "hi" ? "മലയാളം" : "English"}
            </span>
          </button>

          {/* Notifications */}
          <div className="indicator">
            <span className="indicator-item badge badge-primary badge-xs"></span>
            <button className="btn btn-ghost btn-circle btn-sm">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>

          {/* Profile Section with Dropdown */}
          <div className="relative profile-dropdown-container">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 hover:bg-base-200 rounded-lg px-2 py-1 transition-colors"
            >
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="font-bold">{getFarmerInitials()}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-base-content">
                {showProfileDropdown ? "expand_less" : "expand_more"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-base-100 border border-base-300 rounded-lg shadow-xl z-50">
                {/* Profile Info */}
                <div className="p-4 border-b border-base-300">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-12">
                        <span className="font-bold text-lg">{getFarmerInitials()}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-base-content leading-none">
                        {farmerData?.name || "Farmer"}
                      </p>
                      <p className="text-xs font-bold opacity-50 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {farmerData?.district || "India"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setActiveItem("dashboard");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors text-left"
                  >
                    {/* <span className="material-symbols-outlined text-primary">person</span>
                    <span className="text-sm font-bold">
                      {language === "ml" ? "പ്രൊഫൈൽ" : language === "hi" ? "प्रोफ़ाइल" : "Profile"}
                    </span> */}
                  </button>

                  <button
                    onClick={() => {
                      setActiveItem("settings");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-primary">settings</span>
                    <span className="text-sm font-bold">
                      {language === "ml" ? "ക്രമീകരണങ്ങൾ" : language === "hi" ? "सेटिंग्स" : "Settings"}
                    </span>
                  </button>

                  <div className="divider my-1"></div>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-error/10 text-error transition-colors text-left"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-bold">
                      {language === "ml" ? "ലോഗ് ഔട്ട്" : language === "hi" ? "लॉग ഔട്ട്" : "Logout"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm text-center">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl">logout</span>
            </div>
            <h3 className="font-black text-xl">
              {language === "ml" ? "പുറത്തുകടക്കുക?" : language === "hi" ? "लॉग आउट करें?" : "Confirm Logout"}
            </h3>
            <p className="py-4 text-sm opacity-70">
              {language === "ml"
                ? "നിങ്ങൾ ലോഗ് ഔട്ട് ചെയ്യാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?"
                : language === "hi"
                  ? "क्या आप लॉग आउट करना चाहते हैं?"
                  : "Are you sure you want to end your session?"}
            </p>
            <div className="modal-action grid grid-cols-2 gap-3">
              <button className="btn btn-ghost border-base-300" onClick={cancelLogout}>
                {language === "ml" ? "റദ്ദാക്കുക" : language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button className="btn btn-error font-bold" onClick={confirmLogout}>
                {language === "ml" ? "ലോഗ് ഔട്ട്" : language === "hi" ? "लॉग आउट" : "Logout"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={cancelLogout}></div>
        </div>
      )}
    </div>
  );
};

export default AppBar;