import { useState, useEffect } from "react";
import { weatherService } from "../services/api";
import { getWeatherCityOptions } from "../utils/languageOptions";

function WeatherForecast({ language }) {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState({
    city: "",
    lat: "",
    lon: "",
    useCurrentLocation: false,
  });

  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toString();
          const lon = position.coords.longitude.toString();
          setLocation((prev) => ({ ...prev, lat, lon, useCurrentLocation: true }));
          fetchWeatherData(lat, lon);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation((prev) => ({ ...prev, city: "Mumbai", useCurrentLocation: false }));
          fetchWeatherData("", "", "Mumbai");
        }
      );
    } else {
      setLocation((prev) => ({ ...prev, city: "Mumbai", useCurrentLocation: false }));
      fetchWeatherData("", "", "Mumbai");
    }
  };

  const fetchWeatherData = async (lat = "", lon = "", city = "") => {
    setLoading(true);
    setError("");
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        weatherService.getCurrentWeather(lat, lon, city),
        weatherService.getForecast(lat, lon, city, 5),
      ]);

      if (currentResponse.success) setCurrentWeather(currentResponse.data);
      else setError(currentResponse.error || "Failed to fetch current weather");

      if (forecastResponse.success) setForecast(forecastResponse.data.forecast || []);
    } catch (err) {
      setError(language === "ml" ? "കാലാവസ്ഥ വിവരങ്ങൾ കണ്ടെത്താൻ കഴിഞ്ഞില്ല" : "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = () => {
    if (location.city.trim()) {
      setLocation((prev) => ({ ...prev, lat: "", lon: "", useCurrentLocation: false }));
      fetchWeatherData("", "", location.city);
    }
  };

  const getWeatherIcon = (icon, isLarge = false) => {
    const baseUrl = "https://openweathermap.org/img/wn/";
    const size = isLarge ? "@4x" : "@2x";
    return `${baseUrl}${icon}${size}.png`;
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return "text-error";
    if (temp >= 25) return "text-warning";
    return "text-info";
  };

  return (
    <div data-theme="lemonade" className="p-4 md:p-8 bg-base-200 min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary rounded-lg text-primary-content shadow-lg">
            <span className="material-symbols-outlined text-3xl">filter_drama</span>
          </div>
          <h1 className="text-3xl font-black text-base-content tracking-tight">
            {language === "ml" ? "കാലാവസ്ഥ പ്രവചനം" : language === "hi" ? "मौसम पूर्वानुमान" : "Weather Forecast"}
          </h1>
        </div>
        <p className="text-base-content/60 font-medium ml-12">
          {language === "ml" ? "നിങ്ങളുടെ പ്രദേശത്തെ കാലാവസ്ഥ വിവരങ്ങൾ കാണുക" : "Real-time updates for your farm"}
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Location Search Bar */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-4 md:p-6 flex flex-col md:flex-row items-end gap-4">
            <div className="form-control w-full md:w-1/3">
              <label className="label py-1">
                <span className="label-text font-bold opacity-60 uppercase text-[10px] tracking-widest">{language === "hi" ? "शहर चुनें" : "Select City"}</span>
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setLocation(prev => ({ ...prev, city: e.target.value }));
                    fetchWeatherData("", "", e.target.value);
                  }
                }}
                className="select select-bordered w-full bg-base-200 border-none font-bold"
              >
                <option value="">{language === "hi" ? "मुख्य शहर" : "Quick Select"}</option>
                {getWeatherCityOptions(language).map((city) => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>
            </div>

            <div className="form-control flex-1 w-full">
              <label className="label py-1">
                <span className="label-text font-bold opacity-60 uppercase text-[10px] tracking-widest">{language === "hi" ? "या टाइप करें" : "Custom Search"}</span>
              </label>
              <div className="join w-full shadow-sm">
                <input
                  type="text"
                  className="input input-bordered join-item w-full font-medium"
                  value={location.city}
                  onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                  placeholder={language === "hi" ? "शहर का नाम" : "Enter city name..."}
                  onKeyPress={(e) => e.key === "Enter" && handleCitySearch()}
                />
                <button onClick={handleCitySearch} className="btn btn-primary join-item px-6">
                  <span className="material-symbols-outlined">search</span>
                </button>
              </div>
            </div>

            <button onClick={getCurrentLocationWeather} className="btn btn-outline border-base-300 gap-2 w-full md:w-auto">
              <span className="material-symbols-outlined text-primary">my_location</span>
              {language === "hi" ? "वर्तमान स्थान" : "Current"}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error shadow-lg rounded-xl"><span className="material-symbols-outlined">warning</span>{error}</div>}

        {/* Current Weather Grid */}
        {currentWeather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Stats */}
            <div className="lg:col-span-2 card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
              <div className="card-body p-0 flex flex-col md:flex-row">
                <div className="bg-primary text-primary-content p-8 flex flex-col items-center justify-center text-center min-w-[240px]">
                  <img
                    src={getWeatherIcon(currentWeather?.weather?.icon, true)}
                    className="w-32 h-32 drop-shadow-lg"
                    alt="weather"
                  />
                  <h3 className="text-3xl font-black">{currentWeather.location}</h3>
                  <p className="uppercase font-bold tracking-widest opacity-80 text-xs">{currentWeather?.weather?.description}</p>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-7xl font-black tracking-tighter ${getTemperatureColor(currentWeather.temperature)}`}>
                      {currentWeather.temperature}°
                    </span>
                    <span className="text-xl font-bold opacity-40">C</span>
                  </div>
                  <p className="text-base-content/60 font-bold mt-2">
                    Feels like <span className="text-base-content">{currentWeather.feels_like}°C</span>
                  </p>

                  <div className="divider opacity-50"></div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-primary opacity-50 mb-1">humidity_mid</span>
                      <p className="text-[10px] uppercase font-bold opacity-40">Humidity</p>
                      <p className="font-bold">{currentWeather.humidity}%</p>
                    </div>
                    <div className="text-center">
                      <span className="material-symbols-outlined text-primary opacity-50 mb-1">air</span>
                      <p className="text-[10px] uppercase font-bold opacity-40">Wind</p>
                      <p className="font-bold">{currentWeather.wind_speed} km/h</p>
                    </div>
                    <div className="text-center">
                      <span className="material-symbols-outlined text-primary opacity-50 mb-1">compress</span>
                      <p className="text-[10px] uppercase font-bold opacity-40">Pressure</p>
                      <p className="font-bold">{currentWeather.pressure} hPa</p>
                    </div>
                    <div className="text-center">
                      <span className="material-symbols-outlined text-primary opacity-50 mb-1">visibility</span>
                      <p className="text-[10px] uppercase font-bold opacity-40">Visibility</p>
                      <p className="font-bold">{currentWeather.visibility} km</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sun/Moon Card */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body justify-center gap-6">
                <div className="flex items-center gap-4 bg-base-200 p-4 rounded-2xl">
                  <div className="w-12 h-12 bg-warning/20 text-warning rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined font-bold">wb_twilight</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-40 leading-none">Sunrise</p>
                    <p className="text-xl font-black">{new Date(currentWeather.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-base-200 p-4 rounded-2xl">
                  <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined font-bold">nights_stay</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-40 leading-none">Sunset</p>
                    <p className="text-xl font-black">{new Date(currentWeather.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast Grid */}
        {forecast.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest opacity-60 ml-2">
              {language === "ml" ? "5 ദിവസത്തെ പ്രവചനം" : "Next 5 Days"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div key={index} className="card bg-base-100 border border-base-300 hover:shadow-2xl hover:border-primary transition-all group overflow-hidden">
                  <div className="bg-base-200 py-3 text-center border-b border-base-300 group-hover:bg-primary/10 transition-colors">
                    <p className="font-black text-sm uppercase">{index === 0 ? "Today" : day.day_name}</p>
                    <p className="text-[10px] opacity-50 font-bold">{day.date}</p>
                  </div>
                  <div className="card-body p-4 items-center text-center">
                    <img src={getWeatherIcon(day.weather.icon)} className="w-16 h-16" alt="forecast" />
                    <p className="text-xs font-bold opacity-70 h-8 line-clamp-2">{day.weather.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-black text-error">{day.temperature.max}°</span>
                      <span className="opacity-20">|</span>
                      <span className="text-lg font-black text-info">{day.temperature.min}°</span>
                    </div>
                    <div className="divider my-1 opacity-20"></div>
                    <div className="flex flex-col gap-1 w-full text-[10px] font-bold opacity-60 uppercase">
                      <div className="flex justify-between"><span>Rain</span> <span className="text-info">{day.precipitation}mm</span></div>
                      <div className="flex justify-between"><span>Humid</span> <span>{day.humidity}%</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && !currentWeather && (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <span className="loading loading-infinity loading-lg text-primary"></span>
            <p className="font-black uppercase tracking-tighter mt-4">Loading Atmos Data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherForecast;