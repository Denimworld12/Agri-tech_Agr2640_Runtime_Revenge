import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function MarketPrices({ language }) {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [availableCrops, setAvailableCrops] = useState([]);

  const getDefaultDateRange = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return {
      startDate: sevenDaysAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [tips, setTips] = useState([]);
  const [vegetableColumn, setVegetableColumn] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [nearbyMarkets, setNearbyMarkets] = useState(null);
  const [farmerLocation, setFarmerLocation] = useState("");
  const [marketSearchLoading, setMarketSearchLoading] = useState(false);
  const [showMarkets, setShowMarkets] = useState(false);

  // --- Preservation of your Logic Functions ---
  const fetchMarketDataFromBackend = async (startDate, endDate, cropFilter = "") => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/kerala-market/data?start_date=${startDate}&end_date=${endDate || startDate}`;
      if (cropFilter && cropFilter.trim() !== "") url += `&crop_filter=${encodeURIComponent(cropFilter)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const result = await response.json();
        if (result.success) return { data: result.data, crops: result.crops, vegetableColumn: result.vegetable_column };
        else throw new Error(result.error || "Failed to fetch data");
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) { throw error; }
  };

  const fetchDataForDateRange = useCallback(async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchMarketDataFromBackend(dateRange.startDate, dateRange.endDate);
      if (result.data.length > 0) {
        const validCrops = result.crops.filter(crop => crop && !["vegetablename", "crop", "name", ""].includes(crop.toLowerCase()));
        setPriceData(result.data);
        setAvailableCrops(validCrops);
        setVegetableColumn(result.vegetableColumn);
      } else {
        setError(language === "ml" ? "ഈ തീയതിയിൽ ഡാറ്റ ലഭ്യമല്ല" : "No data available");
      }
    } catch (error) { setError(error.message); } finally { setLoading(false); }
  }, [dateRange.startDate, dateRange.endDate, language]);

  useEffect(() => { fetchDataForDateRange(); }, [fetchDataForDateRange]);

  const analyzeDataWithBackend = async (allData, selectedCrops, vegetableColumn) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kerala-market/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: allData, selectedCrops, vegetableColumn }),
    });
    const result = await response.json();
    if (result.success) return result;
    throw new Error(result.error || "Analysis failed");
  };

  const fetchNearbyMarkets = async () => {
    if (selectedCrops.length === 0) { setError("Please select crops first"); return; }
    setMarketSearchLoading(true);
    try {
      const cropsParam = selectedCrops.join(",");
      let url = `${import.meta.env.VITE_API_URL}/api/markets/nearby-markets?crops=${encodeURIComponent(cropsParam)}`;
      if (farmerLocation.trim()) url += `&location=${encodeURIComponent(farmerLocation)}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) { setNearbyMarkets(result); setShowMarkets(true); }
    } catch (error) { setError("Error finding markets"); } finally { setMarketSearchLoading(false); }
  };

  const applyFilters = async () => {
    if (selectedCrops.length === 0 || !vegetableColumn) return;
    setLoading(true);
    try {
      const result = await analyzeDataWithBackend(priceData, selectedCrops, vegetableColumn);
      setAnalysisData(result.filtered_data);
      setTips(result.tips.map(tip => typeof tip === "object" ? tip.message || tip.text : String(tip)));
    } catch (error) { setError("Error analyzing data"); } finally { setLoading(false); }
  };

  return (
    <div data-theme="lemonade" className="p-4 md:p-8 bg-base-200 min-h-screen">

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary rounded-lg text-primary-content shadow-lg">
            <span className="material-symbols-outlined text-3xl">currency_rupee</span>
          </div>
          <h1 className="text-3xl font-black text-base-content tracking-tight">
            {language === "ml" ? "കേരള വെജിറ്റബിൾ മാർക്കറ്റ്" : language === "hi" ? "केरल सब्जी बाजार भाव" : "Market Price Analysis"}
          </h1>
        </div>
        <p className="text-base-content/60 font-medium ml-12">
          {language === "ml" ? "നിങ്ങളുടെ വിളകൾക്ക് മികച്ച വില കണ്ടെത്തുക" : "Track daily vegetable rates across Kerala"}
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Date Filter Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <h3 className="card-title text-sm uppercase tracking-widest opacity-60 mb-4">
              <span className="material-symbols-outlined text-primary">date_range</span>
              {language === "hi" ? "दिनांक सीमा और फिल्टर" : "Timeframe Selection"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold">Start Date</span></label>
                <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} className="input input-bordered h-12" />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold">End Date</span></label>
                <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} className="input input-bordered h-12" />
              </div>
              <button onClick={fetchDataForDateRange} disabled={loading} className="btn btn-primary h-12 shadow-md">
                {loading ? <span className="loading loading-spinner"></span> : <><span className="material-symbols-outlined">sync</span> {language === "hi" ? "रीफ्रेश करें" : "Sync Data"}</>}
              </button>
            </div>
          </div>
        </div>

        {/* Crop Multi-Select Card */}
        {availableCrops.length > 0 && (
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body p-6">
              <h3 className="card-title text-sm uppercase tracking-widest opacity-60 mb-4">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
                Choose Commodities
              </h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-base-200 rounded-xl mb-4">
                {availableCrops.map((crop) => (
                  <label key={crop} className="label cursor-pointer gap-2 bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 hover:border-primary transition-all">
                    <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={selectedCrops.includes(crop)} onChange={(e) => e.target.checked ? setSelectedCrops([...selectedCrops, crop]) : setSelectedCrops(selectedCrops.filter(c => c !== crop))} />
                    <span className="label-text font-bold text-xs">{crop}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={applyFilters} disabled={selectedCrops.length === 0 || loading} className="btn btn-primary px-8">
                  {language === "hi" ? "लागू करें" : "Analyze Selection"}
                </button>
                <button onClick={() => { setSelectedCrops([]); setAnalysisData(null); }} className="btn btn-ghost">Clear</button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis & Visualization Results */}
        {analysisData && analysisData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Chart Area */}
            <div className="lg:col-span-2 card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="card-title text-base font-black mb-4">Price Volatility Index</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer>
                    <LineChart data={analysisData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="Date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="Wholesale_Avg" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} name="Wholesale" />
                      <Line type="monotone" dataKey="Retail_Avg" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Retail" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Smart Tips Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {tips.length > 0 && (
                <div className="card bg-primary text-primary-content shadow-xl">
                  <div className="card-body p-6">
                    <h3 className="flex items-center gap-2 font-black text-lg">
                      <span className="material-symbols-outlined">lightbulb</span>
                      Farmer Insights
                    </h3>
                    <ul className="space-y-4 mt-4">
                      {tips.map((tip, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed bg-white/10 p-3 rounded-xl">
                          <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Market Locator Button */}
              <div className="card bg-secondary text-secondary-content shadow-lg">
                <div className="card-body p-6 text-center">
                  <span className="material-symbols-outlined text-4xl mb-2">location_on</span>
                  <h4 className="font-bold">Market Locator</h4>
                  <p className="text-xs opacity-70 mb-4">Find D-Mart or local traders near your area</p>
                  <input type="text" className="input input-sm input-bordered w-full bg-white/20 text-white placeholder:text-white/50 mb-3" placeholder="Enter City..." value={farmerLocation} onChange={(e) => setFarmerLocation(e.target.value)} />
                  <button onClick={fetchNearbyMarkets} disabled={marketSearchLoading} className="btn btn-sm btn-block bg-white text-secondary border-none">
                    {marketSearchLoading ? <span className="loading loading-spinner"></span> : "Find Markets"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nearby Markets Modal/Display */}
        {showMarkets && nearbyMarkets && (
          <div className="card bg-base-100 shadow-2xl border border-base-300">
            <div className="card-body">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">storefront</span>
                  Available Trading Hubs ({nearbyMarkets.total_markets})
                </h3>
                <button className="btn btn-circle btn-ghost btn-sm" onClick={() => setShowMarkets(false)}>✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(nearbyMarkets.markets_by_category).map(([category, markets]) =>
                  markets.map(market => (
                    <div key={market.id} className="p-4 rounded-2xl bg-base-200 border border-base-300 hover:border-primary transition-all">
                      <div className="flex justify-between mb-2">
                        <span className="badge badge-primary badge-sm font-bold">{category}</span>
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{market.distance_km} KM away</span>
                      </div>
                      <h5 className="font-black text-base-content mb-1">{market.name}</h5>
                      <p className="text-xs opacity-60 line-clamp-1 mb-3">{market.address}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {market.matching_crops.map((c, idx) => <span key={idx} className="text-[8px] bg-white px-2 py-0.5 rounded font-black uppercase">{c}</span>)}
                      </div>
                      <a href={`tel:${market.phone}`} className="btn btn-xs btn-block btn-outline border-base-300 gap-2">
                        <span className="material-symbols-outlined text-[14px]">call</span> {market.phone}
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay for full screen fetch */}
      {loading && priceData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <span className="loading loading-infinity loading-lg text-primary"></span>
          <p className="font-black uppercase tracking-tighter mt-4">Analyzing Market Trends...</p>
        </div>
      )}
    </div>
  );
}

export default MarketPrices;