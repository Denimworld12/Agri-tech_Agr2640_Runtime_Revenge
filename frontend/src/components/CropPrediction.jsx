import React, { useState, useEffect, useCallback } from "react";
import Tesseract from "tesseract.js";
import { cropPredictionService } from "../services/api";

/* ---------------- OCR HELPERS ---------------- */

const normalizeText = (text) =>
  text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/kg\s*\/?\s*ha/gi, "kg/ha")
    .replace(/PH/g, "pH")
    .toLowerCase();

const extractSoilDataFromText = (rawText) => {
  if (!rawText) return {};

  const text = normalizeText(rawText);

  const extractValue = (keyword) => {
    const regex = new RegExp(`${keyword}[^0-9]{0,20}([0-9]+\\.?[0-9]*)`, "i");
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : null;
  };

  return {
    ph: extractValue("ph"),
    N: 305, // demo
    P: extractValue("phosphorus"),
    K: extractValue("potassium"),
  };
};

/* ---------------- HELPERS ---------------- */

const getIndianSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return "kharif";
  if (month >= 10 || month <= 3) return "rabi";
  return "zaid";
};

const nutrientStatus = (value) => {
  if (value == null) return "Unknown";
  if (value < 50) return "Low";
  if (value < 150) return "Medium";
  return "High";
};

/* ---------------- COMPONENT ---------------- */

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

  const [soilNPK, setSoilNPK] = useState({ N: null, P: null, K: null });
  const [predictions, setPredictions] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");
  const [showTips, setShowTips] = useState(false); // ✅ ADDED

  /* ---------------- LOAD OPTIONS ---------------- */

  const loadOptions = useCallback(async () => {
    try {
      const response = await cropPredictionService.getPredictionOptions(language);
      if (response.success) setOptions(response.options);
    } catch {
      setError("Failed to load form options");
    }
  }, [language]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  /* ---------------- OCR HANDLER ---------------- */

  const handleSoilCardUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrMessage("");
    setError("");

    try {
      const imageUrl = URL.createObjectURL(file);
      const { data: { text } } = await Tesseract.recognize(imageUrl, "eng");
      URL.revokeObjectURL(imageUrl);

      const { ph, N, P, K } = extractSoilDataFromText(text);

      setFormData((prev) => ({
        ...prev,
        ph_level: ph ?? 6.5,
        season: prev.season || getIndianSeason(),
        state: prev.state || "maharashtra",
      }));

      setSoilNPK({ N, P, K });
      setOcrMessage("Soil Health Card values extracted");
    } catch {
      setOcrMessage("OCR failed, please enter manually");
    } finally {
      setOcrLoading(false);
    }
  };

  /* ---------------- INPUT HANDLER ---------------- */

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  /* ---------------- PREDICT ---------------- */

  const handlePredict = async (e) => {
    e.preventDefault();

    if (!formData.soil_type || !formData.season || !formData.state) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        ph_level: parseFloat(formData.ph_level),
        N: soilNPK.N,
        P: soilNPK.P,
        K: soilNPK.K,
      };

      const response = await cropPredictionService.predictCrops(payload);
      if (response.success) setPredictions(response);
      else throw new Error();
    } catch {
      setError("Error predicting crops");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div data-theme="lemonade" className="p-4 md:p-8 bg-base-200 min-h-screen">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-black">Crop Prediction</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT FORM */}
        <div className="lg:col-span-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <form onSubmit={handlePredict} className="space-y-4">

                <select
                  className="select select-bordered"
                  value={formData.soil_type}
                  onChange={(e) => handleInputChange("soil_type", e.target.value)}
                >
                  <option value="">Select Soil Type</option>
                  {options?.soil_types?.map((soil) => (
                    <option key={soil.value} value={soil.value}>
                      {soil.label}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.1"
                  placeholder="Soil pH"
                  className="input input-bordered"
                  value={formData.ph_level}
                  onChange={(e) => handleInputChange("ph_level", e.target.value)}
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSoilCardUpload}
                  className="file-input file-input-bordered"
                />

                {ocrLoading && <p className="text-sm">Reading Soil Card…</p>}
                {ocrMessage && <p className="text-sm">{ocrMessage}</p>}

                {(soilNPK.N || soilNPK.P || soilNPK.K) && (
                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-bold mb-2">Soil Nutrients (NPK)</h4>
                    <div className="flex gap-2 flex-wrap">
                      <span className="badge badge-info">
                        N: {soilNPK.N} ({nutrientStatus(soilNPK.N)})
                      </span>
                      <span className="badge badge-warning">
                        P: {soilNPK.P} ({nutrientStatus(soilNPK.P)})
                      </span>
                      <span className="badge badge-success">
                        K: {soilNPK.K} ({nutrientStatus(soilNPK.K)})
                      </span>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-full">
                  {loading ? "Predicting..." : "Run Prediction"}
                </button>
              </form>

              {error && <div className="alert alert-error mt-4">{error}</div>}
            </div>
          </div>
        </div>

        {/* RIGHT RESULTS */}
        <div className="lg:col-span-8">
          {predictions && (
            <>
              <h3 className="text-xl font-bold mb-4">Recommended Crops</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.predicted_crops.map((crop) => (
                  <div key={crop.crop_key} className="card bg-base-100 shadow">
                    <div className="card-body">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-lg">🌱 {crop.crop_name}</h4>
                        <span className="badge badge-success">
                          {crop.suitability_percentage}%
                        </span>
                      </div>

                      <progress
                        className="progress progress-success w-full mt-2"
                        value={crop.suitability_percentage}
                        max="100"
                      />

                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-semibold">
                          Why recommended?
                        </summary>
                        <p className="text-sm opacity-70 mt-1">
                          Suitable for {formData.soil_type} soil with pH{" "}
                          {formData.ph_level}.
                        </p>
                      </details>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="card bg-base-100 shadow mt-8 text-center">
                <div className="card-body">
                  <h3 className="font-black text-lg">
                    Want fertilizer or irrigation advice?
                  </h3>
                  <p className="opacity-70 text-sm">
                    Based on your soil health, we can suggest next actions.
                  </p>
                  <button
                    className="btn btn-outline btn-success mt-3"
                    onClick={() => setShowTips(true)}
                  >
                    Get Soil Improvement Tips
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 🔥 SOIL TIPS MODAL */}
      {showTips && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-black text-lg mb-3">
              🌱 Soil Improvement Tips
            </h3>

            <ul className="list-disc pl-5 space-y-2 text-sm">
              {soilNPK.N < 50 && <li>Add urea or compost to improve Nitrogen.</li>}
              {soilNPK.P < 50 && (
                <li>Apply Single Super Phosphate (SSP).</li>
              )}
              {soilNPK.K < 50 && <li>Add potash or wood ash.</li>}
              {formData.ph_level < 6 && (
                <li>Use agricultural lime to reduce acidity.</li>
              )}
              {formData.ph_level > 7.5 && (
                <li>Add gypsum or organic manure.</li>
              )}
              <li>Ensure proper irrigation and avoid waterlogging.</li>
              <li>Use organic manure for long-term soil fertility.</li>
            </ul>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowTips(false)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default CropPrediction;
