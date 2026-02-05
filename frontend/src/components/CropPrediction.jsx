import React, { useState, useEffect, useCallback } from "react";
import { cropPredictionService } from "../services/api";

const CropPrediction = ({ language = "en" }) => {
  const [formData, setFormData] = useState({
    soil_type: "",
    season: "",
    state: "",
    ph_level: "",
    water_availability: "medium",
    experience_level: "intermediate",
    farm_size: "small",
  });

  const [predictions, setPredictions] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCrop, setSelectedCrop] = useState(null);

  const loadOptions = useCallback(async () => {
    try {
      const response = await cropPredictionService.getPredictionOptions(language);
      if (response.success) setOptions(response.options);
    } catch (err) {
      console.error("Error loading options:", err);
      setError("Failed to load form options");
    }
  }, [language]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!formData.soil_type || !formData.season || !formData.state) {
      setError(language === "hi" ? "कृपया सभी आवश्यक फ़ील्ड भरें" : language === "ml" ? "ദയവായി എല്ലാ ആവശ്യമായ ഫീൽഡുകളും പൂരിപ്പിക്കുക" : "Please fill all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const predictionData = { ...formData, ph_level: formData.ph_level ? parseFloat(formData.ph_level) : null };
      const response = await cropPredictionService.predictCrops(predictionData);
      if (response.success) setPredictions(response);
      else throw new Error(response.error || "Prediction failed");
    } catch (err) {
      setError(`${language === "hi" ? "फसल की भविष्यवाणी में त्रुटि" : language === "ml" ? "വിള പ്രവചനത്തിൽ പിശക്" : "Error predicting crops"}: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const viewCropDetails = async (cropKey) => {
    try {
      const response = await cropPredictionService.getCropDetails(cropKey);
      if (response.success) setSelectedCrop(response.crop_data);
    } catch (err) { console.error(err); }
  };

  const getSuitabilityColor = (p) => {
    if (p >= 80) return "badge-success";
    if (p >= 65) return "badge-info";
    if (p >= 50) return "badge-warning";
    return "badge-error";
  };

  return (
    <div data-theme="lemonade" className="p-4 md:p-8 bg-base-200 min-h-screen">

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary rounded-lg text-primary-content shadow-lg">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h1 className="text-3xl font-black text-base-content tracking-tight">
              {language === "hi" ? "फसल की भविष्यवाणी" : language === "ml" ? "വിള പ്രവചനം" : "Crop Prediction"}
            </h1>
          </div>
          <p className="text-base-content/60 font-medium">
            {language === "hi" ? "अपनी भूमि के लिए सर्वोत्तम फसलों की खोज करें" : "Discover the best crops for your land and conditions"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Input Form (lg:span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body p-6">
              <h3 className="card-title text-base uppercase tracking-widest opacity-70 mb-4">
                <span className="material-symbols-outlined text-primary">analytics</span>
                {language === "hi" ? "इनपुट पैरामीटर" : "Farm Analysis"}
              </h3>

              <form onSubmit={handlePredict} className="space-y-4">
                {/* Soil Type */}
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-bold">{language === "hi" ? "मिट्टी का प्रकार" : "Soil Type"} *</span></label>
                  <select
                    className="select select-bordered select-sm h-12"
                    value={formData.soil_type}
                    onChange={(e) => handleInputChange("soil_type", e.target.value)}
                    required
                  >
                    <option value="">{language === "hi" ? "चुनें" : "Select"}</option>
                    {options?.soil_types?.map((soil) => <option key={soil.value} value={soil.value}>{soil.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Season */}
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text font-bold">{language === "hi" ? "मौसम" : "Season"} *</span></label>
                    <select className="select select-bordered h-12" value={formData.season} onChange={(e) => handleInputChange("season", e.target.value)} required>
                      <option value="">{language === "hi" ? "चुनें" : "Select"}</option>
                      {options?.seasons?.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  {/* pH Level */}
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text font-bold">Soil pH</span></label>
                    <input type="number" step="0.1" className="input input-bordered h-12" placeholder="6.5" value={formData.ph_level} onChange={(e) => handleInputChange("ph_level", e.target.value)} />
                  </div>
                </div>

                {/* State */}
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-bold">{language === "hi" ? "राज्य" : "State"} *</span></label>
                  <select className="select select-bordered h-12" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} required>
                    <option value="">{language === "hi" ? "चुनें" : "Select"}</option>
                    {options?.states?.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-block h-14 text-lg font-bold shadow-lg">
                  {loading ? <span className="loading loading-spinner"></span> : <><span className="material-symbols-outlined">auto_fix</span> {language === "hi" ? "भविष्यवाणी करें" : "Run Prediction"}</>}
                </button>

                <button type="button" className="btn btn-ghost btn-block btn-sm opacity-50" onClick={() => { setFormData({ soil_type: "", season: "", state: "", ph_level: "", water_availability: "medium", experience_level: "intermediate", farm_size: "small" }); setPredictions(null); }}>
                  {language === "hi" ? "रीसेट" : "Reset Form"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Results (lg:span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {error && <div className="alert alert-error shadow-lg"> <span className="material-symbols-outlined">error</span> <span>{error}</span> </div>}

          {!predictions && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
              <span className="material-symbols-outlined text-9xl">agriculture</span>
              <p className="text-xl font-bold mt-4">Enter farm details to see recommendations</p>
            </div>
          )}

          {loading && (
            <div className="card bg-base-100 shadow-xl py-20 text-center">
              <span className="loading loading-ring loading-lg text-primary mx-auto mb-4"></span>
              <p className="font-bold opacity-70 animate-pulse">{language === "hi" ? "विश्लेषण कर रहे हैं..." : "Analyzing soil & climate data..."}</p>
            </div>
          )}

          {predictions && predictions.success && (
            <>
              {/* Summary Banner */}
              <div className="card bg-primary text-primary-content shadow-2xl overflow-hidden">
                <div className="card-body p-6 flex flex-row items-center gap-6">
                  <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md hidden sm:block">
                    <span className="material-symbols-outlined text-5xl">verified</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{language === "hi" ? "भविष्यवाणी सारांश" : "Success! Recommendations Ready"}</h3>
                    <p className="opacity-90 text-sm mt-1">{predictions.summary}</p>
                    <div className="flex gap-2 mt-4">
                      {predictions.real_time_data?.weather_integrated && <span className="badge badge-ghost gap-1 py-3"><span className="material-symbols-outlined text-sm">wb_sunny</span> Weather Live</span>}
                      {predictions.real_time_data?.market_prices_integrated && <span className="badge badge-ghost gap-1 py-3"><span className="material-symbols-outlined text-sm">payments</span> Prices Live</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Crop Grid */}
              <h3 className="text-lg font-black uppercase tracking-widest opacity-60 ml-2">Recommended Crops</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.predicted_crops.map((crop) => (
                  <div key={crop.crop_key} className="card bg-base-100 border border-base-300 hover:shadow-2xl hover:border-primary transition-all group">
                    <div className="card-body p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-black text-base-content">{crop.crop_name}</h4>
                          <div className={`badge ${getSuitabilityColor(crop.suitability_percentage)} font-bold mt-1`}>
                            {crop.suitability_percentage}% Match
                          </div>
                        </div>
                        <div className="avatar placeholder">
                          <div className="bg-base-200 text-primary rounded-xl w-12 border border-base-300">
                            <span className="material-symbols-outlined">eco</span>
                          </div>
                        </div>
                      </div>

                      <div className="divider my-2 opacity-50"></div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="opacity-60">Market Price</span><span className="font-bold text-success">{crop.details.current_market_price || crop.details.market_price_range}</span></div>
                        <div className="flex justify-between"><span className="opacity-60">Est. Yield</span><span className="font-bold">{crop.details.yield_per_acre}</span></div>
                        <div className="flex justify-between"><span className="opacity-60">Growth</span><span className="font-bold">{crop.details.growth_period_days} Days</span></div>
                      </div>

                      <button onClick={() => viewCropDetails(crop.crop_key)} className="btn btn-outline btn-primary btn-sm mt-4 group-hover:btn-primary border-base-300 transition-all">
                        Full Insights <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedCrop && (
        <div className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box max-w-2xl bg-base-100 p-0 overflow-hidden border border-base-300">
            <div className="bg-primary p-6 text-primary-content flex justify-between items-center">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <span className="material-symbols-outlined">potted_plant</span>
                {selectedCrop.name}
              </h3>
              <button className="btn btn-ghost btn-circle" onClick={() => setSelectedCrop(null)}>✕</button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-base-200 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold opacity-50">Water</p><p className="font-bold">{selectedCrop.water_requirement}</p></div>
                <div className="bg-base-200 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold opacity-50">Temp</p><p className="font-bold">{selectedCrop.temperature_range.join("-")}°C</p></div>
                <div className="bg-base-200 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold opacity-50">pH</p><p className="font-bold">{selectedCrop.ph_range.join("-")}</p></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-black text-success flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined">add_task</span> Advantages
                  </h4>
                  <ul className="space-y-2">
                    {selectedCrop.pros.map((p, i) => <li key={i} className="text-sm flex items-start gap-2 bg-success/5 p-2 rounded-lg border border-success/10"><span className="material-symbols-outlined text-success text-xs mt-1">check_circle</span> {p}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-black text-error flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined">warning</span> Risks
                  </h4>
                  <ul className="space-y-2">
                    {selectedCrop.cons.map((c, i) => <li key={i} className="text-sm flex items-start gap-2 bg-error/5 p-2 rounded-lg border border-error/10"><span className="material-symbols-outlined text-error text-xs mt-1">cancel</span> {c}</li>)}
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-4 bg-base-200 flex justify-end">
              <button className="btn btn-primary" onClick={() => setSelectedCrop(null)}>Close Insight</button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setSelectedCrop(null)}></div>
        </div>
      )}
    </div>
  );
};

export default CropPrediction;