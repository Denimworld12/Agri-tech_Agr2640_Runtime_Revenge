import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({
  isCollapsed,
  language = "en",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = location.pathname.split('/')[1] || "dashboard"; // Get current route name

  // Mapping for route aliases
  const getActiveId = () => {
    if (activeItem === "") return "dashboard";
    return activeItem;
  };

  const currentId = getActiveId();

  const [loc, setLoc] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLoc({ latitude, longitude });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoc({ error: "Unable to fetch location" });
          setIsLoading(false);
        }
      );
    } else {
      setLoc({ error: "Geolocation not supported" });
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: "dashboard", name: { en: "Agriti AI", hi: "डैशबोर्ड", ml: "ഡാഷ്ബോർഡ്" }, icon: "dashboard" },
    { id: "crops", name: { en: "Crop Prediction", hi: "फसल भविष्यवाणी", ml: "വിള പ്രവചനം" }, icon: "agriculture" },
    { id: "weather", name: { en: "Weather Forecast", hi: "मौसम पूर्वानुमान", ml: "കാലാവസ്ഥ പ്രവചനം" }, icon: "thermostat" },
    { id: "analytics", name: { en: "Market Prices", hi: "बाजार भाव", ml: "വിപണി വിലകൾ" }, icon: "trending_up" },
    { id: "disease-detector", name: { en: "Disease Detector", hi: "रोग डिटेक्टर", ml: "രോഗ നിർണയം" }, icon: "biotech" },
    // { id: "inventory", name: { en: "Inventory", hi: "इन्वेंट्री", ml: "ഇൻവെന്ററി" }, icon: "inventory_2" },
    { id: "reports", name: { en: "Schemes", hi: "योजनाएं", ml: "പദ്ധതികൾ" }, icon: "verified" },
    { id: "settings", name: { en: "Settings", hi: "सेटिंग्स", ml: "ക്രമീകരണങ്ങൾ" }, icon: "settings" },
  ];

  const getLabel = (item) => item.name[language] || item.name.en;

  return (
    <>
      {/* Desktop Sidebar - Left side */}
      <div
        data-theme="lemonade"
        className={`${isCollapsed ? "w-20" : "w-64"
          } pt-16 pb-20 lg:pb-0 bg-[#064e3b] text-white min-h-screen transition-all duration-300 flex-col shadow-2xl hidden lg:flex`}
      >
        {/* Brand Header */}
        <div className={`p-6 border-b border-white/10 ${isCollapsed ? "text-center" : ""}`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#bef264] text-3xl font-bold">
              potted_plant
            </span>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-black text-white leading-tight tracking-tight">
                  {language === "ml" ? "അഗ്രിഡാഷ്" : language === "hi" ? "एग्रीडैश" : "AgriDash"}
                </h2>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#bef264]/80">
                  {language === "ml" ? "കർഷകർ" : language === "hi" ? "किसान" : "Farmer Portal"}
                </p>
              </div>
            )}
          </div>

          {/* Location Section */}
          {!isCollapsed && (
            <div className="mt-6 bg-black/20 p-3 rounded-xl border border-white/10">
              <button
                onClick={fetchLocation}
                disabled={isLoading}
                className="btn btn-sm btn-block gap-2 bg-[#bef264] hover:bg-[#a3e635] text-[#064e3b] border-none normal-case font-bold shadow-lg"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <span className="material-symbols-outlined text-sm">my_location</span>
                )}
                <span className="text-xs">
                  {language === "ml" ? "ലൊക്കേഷൻ" : language === "hi" ? "स्थान" : "Location"}
                </span>
              </button>

              {loc && (
                <div className="mt-2 text-[10px] font-mono text-white/60 flex justify-between px-1">
                  {loc.error ? (
                    <span className="text-error/80">{loc.error}</span>
                  ) : (
                    <>
                      <span>{loc.latitude?.toFixed(2)}°N</span>
                      <span>{loc.longitude?.toFixed(2)}°E</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="menu menu-md px-3 gap-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => navigate(`/${item.id}`)}
                  className={`flex items-center gap-4 py-3 rounded-xl transition-all duration-200 ${currentId === item.id
                    ? "bg-white text-[#064e3b] font-bold shadow-lg scale-[1.02]"
                    : "hover:bg-white/10 text-white/70 hover:text-white"
                    } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
                  title={isCollapsed ? getLabel(item) : ""}
                >
                  <span className={`material-symbols-outlined ${currentId === item.id ? "text-[#064e3b]" : "text-inherit"}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="text-sm tracking-wide">{getLabel(item)}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Info */}
        {!isCollapsed && (
          <div className="p-4 border-t border-white/5 text-center">
            <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em]">
              Agriti Platform
            </p>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Bottom Navigation */}
      <div
        data-theme="lemonade"
        className="fixed bottom-0 left-0 right-0 bg-[#064e3b] text-white border-t border-white/10 shadow-2xl z-40 lg:hidden pb-safe"
      >
        <nav className="flex items-center justify-around px-2 py-3 overflow-x-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              className={`flex flex-col items-center justify-center min-w-[60px] px-2 py-2 rounded-xl transition-all duration-200 ${currentId === item.id
                ? "bg-white text-[#064e3b] shadow-lg scale-105"
                : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              title={getLabel(item)}
            >
              <span className={`material-symbols-outlined text-2xl ${currentId === item.id ? "text-[#064e3b]" : "text-inherit"}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold mt-1 truncate max-w-full">
                {getLabel(item).split(' ')[0]}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;