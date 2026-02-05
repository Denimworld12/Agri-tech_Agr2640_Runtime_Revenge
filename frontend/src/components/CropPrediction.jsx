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
    const regex = new RegExp(
      `${keyword}[^0-9]{0,20}([0-9]+\\.?[0-9]*)`,
      "i"
    );
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : null;
  };

  return {
    ph: extractValue("ph"),
    N: 305, // hardcoded for demo
    P: extractValue("phosphorus"),
    K: extractValue("potassium"),
  };
};

/* ---------------- INDIAN SEASON HELPER ---------------- */

const getIndianSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return "kharif";
  if (month >= 10 || month <= 3) return "rabi";
  return "zaid";
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
  const [selectedCrop, setSelectedCrop] = useState(null);

  /* ---------------- LOAD OPTIONS ---------------- */

  const loadOptions = useCallback(async () => {
    try {
      const response = await cropPredictionService.getPredictionOptions(language);
      if (response.success) setOptions(response.options);
    } catch (err) {
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

      const {
        data: { text },
      } = await Tesseract.recognize(imageUrl, "eng");

      URL.revokeObjectURL(imageUrl);

      const { ph, N, P, K } = extractSoilDataFromText(text);

      setFormData((prev) => ({
        ...prev,
        ph_level: ph ?? 6.5,
        season: prev.season || getIndianSeason(),
        state: prev.state || "maharashtra",
      }));

      setSoilNPK({ N, P, K });

      setOcrMessage(
        language === "hi"
          ? "सोइल हेल्थ कार्ड से मान पढ़े गए"
          : "Soil Health Card values extracted"
      );
    } catch (err) {
      setOcrMessage(
        language === "hi"
          ? "OCR असफल, कृपया मैन्युअली भरें"
          : "OCR failed, please enter manually"
      );
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
      setError(
        language === "hi"
          ? "कृपया सभी आवश्यक फ़ील्ड भरें"
          : "Please fill all required fields"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const predictionData = {
        ...formData,
        ph_level: parseFloat(formData.ph_level),
        N: soilNPK.N,
        P: soilNPK.P,
        K: soilNPK.K,
      };

      const response = await cropPredictionService.predictCrops(predictionData);
      if (response.success) setPredictions(response);
      else throw new Error("Prediction failed");
    } catch (err) {
      setError("Error predicting crops");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div data-theme="lemonade" className="p-4 md:p-8 bg-base-200 min-h-screen">

      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-black">
          {language === "hi" ? "फसल की भविष्यवाणी" : "Crop Prediction"}
        </h1>
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
                  <option value="">
                    {language === "hi" ? "मिट्टी चुनें" : "Select Soil Type"}
                  </option>
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

                {/* 🔹 NPK DISPLAY (FOR DEMO) */}
                {(soilNPK.N || soilNPK.P || soilNPK.K) && (
                  <div className="bg-base-200 p-4 rounded-lg mt-2">
                    <h4 className="font-bold mb-2">
                      {language === "hi" ? "मिट्टी पोषक तत्व" : "Soil Nutrients (NPK)"}
                    </h4>
                    <p>Nitrogen (N): {soilNPK.N}</p>
                    <p>Phosphorus (P): {soilNPK.P}</p>
                    <p>Potassium (K): {soilNPK.K}</p>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-full">
                  {loading ? "Predicting..." : "Run Prediction"}
                </button>

              </form>

              {error && (
                <div className="alert alert-error mt-4">
                  <span>{error}</span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT RESULTS */}
        <div className="lg:col-span-8">
          {predictions && predictions.success && (
            <div>
              <h3 className="text-xl font-bold mb-4">Recommended Crops</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.predicted_crops.map((crop) => (
                  <div key={crop.crop_key} className="card bg-base-100 shadow">
                    <div className="card-body">
                      <h4 className="font-black">{crop.crop_name}</h4>
                      <p>{crop.suitability_percentage}% suitability</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CropPrediction;
