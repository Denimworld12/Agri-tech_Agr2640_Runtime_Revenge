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
    N: 305,
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

const CropPrediction = () => {
  const [formData, setFormData] = useState({
    soil_type: "",
    season: "",
    state: "",
    ph_level: "",
  });

  const [soilNPK, setSoilNPK] = useState({ N: null, P: null, K: null });
  const [predictions, setPredictions] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");
  const [showTips, setShowTips] = useState(false);

  /* ---------------- LOAD OPTIONS ---------------- */

  const loadOptions = useCallback(async () => {
    try {
      const response =
        await cropPredictionService.getPredictionOptions("en");
      if (response.success) setOptions(response.options);
    } catch {
      setError("Failed to load form options");
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  /* ---------------- OCR ---------------- */

  const handleSoilCardUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      const {
        data: { text },
      } = await Tesseract.recognize(imageUrl, "eng");

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
      setOcrMessage("OCR failed");
    } finally {
      setOcrLoading(false);
    }
  };

  /* ---------------- SOIL DETECTION ---------------- */

  const detectSoilByLocation = () => {
    navigator.geolocation.getCurrentPosition(() => {
      setFormData((prev) => ({
        ...prev,
        soil_type: "alluvial",
      }));
      alert("Soil type detected as Alluvial Soil");
    });
  };

  const openCameraForSoil = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = handleSoilCardUpload;
    input.click();
  };

  /* ---------------- PREDICT ---------------- */

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response =
        await cropPredictionService.predictCrops({
          ...formData,
          ph_level: parseFloat(formData.ph_level),
          N: soilNPK.N,
          P: soilNPK.P,
          K: soilNPK.K,
        });

      if (response.success) setPredictions(response);
    } catch {
      setError("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-black mb-6">Crop Prediction</h1>

      <div className="grid lg:grid-cols-12 gap-8">

        {/* LEFT PANEL */}
        <div className="lg:col-span-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">

              <div className="flex gap-2">
                <button className="btn btn-outline btn-sm" onClick={detectSoilByLocation}>
                  Detect by Location
                </button>
                <button className="btn btn-outline btn-sm" onClick={openCameraForSoil}>
                  Detect by Camera
                </button>
              </div>

              <select
                className="select select-bordered"
                value={formData.soil_type}
                onChange={(e) =>
                  setFormData({ ...formData, soil_type: e.target.value })
                }
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
                placeholder="Soil pH"
                className="input input-bordered"
                value={formData.ph_level}
                onChange={(e) =>
                  setFormData({ ...formData, ph_level: e.target.value })
                }
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleSoilCardUpload}
                className="file-input file-input-bordered"
              />

              {ocrLoading && <p>Reading Soil Card...</p>}
              {ocrMessage && <p>{ocrMessage}</p>}

              {(soilNPK.N || soilNPK.P || soilNPK.K) && (
                <div className="bg-base-200 p-3 rounded">
                  <h4 className="font-bold">Soil Nutrients</h4>
                  <p>N: {soilNPK.N} ({nutrientStatus(soilNPK.N)})</p>
                  <p>P: {soilNPK.P} ({nutrientStatus(soilNPK.P)})</p>
                  <p>K: {soilNPK.K} ({nutrientStatus(soilNPK.K)})</p>
                </div>
              )}

              <button className="btn btn-primary w-full" onClick={handlePredict}>
                {loading ? "Predicting..." : "Run Prediction"}
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-8">

          {predictions && (
            <>
              {/* SUMMARY */}
              <div className="card bg-base-100 shadow mb-6">
                <div className="card-body">
                  <h3 className="font-bold text-lg">Soil Summary</h3>
                  <p>Soil Type: {formData.soil_type}</p>
                  <p>pH: {formData.ph_level}</p>
                  <p>Season: {formData.season}</p>
                </div>
              </div>

              {/* CROPS */}
              <h3 className="font-bold text-lg mb-3">Recommended Crops</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {predictions.predicted_crops.map((crop) => (
                  <div key={crop.crop_key} className="card bg-base-100 shadow">
                    <div className="card-body">
                      <h4 className="font-bold">🌱 {crop.crop_name}</h4>
                      <progress
                        className="progress progress-success"
                        value={crop.suitability_percentage}
                        max="100"
                      />
                      <p>{crop.suitability_percentage}% suitability</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="card bg-base-100 shadow mt-6 text-center">
                <div className="card-body">
                  <button className="btn btn-success" onClick={() => setShowTips(true)}>
                    Get Soil Improvement Tips
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* MODAL */}
      {showTips && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Soil Improvement Tips</h3>
            <ul className="list-disc pl-5 mt-3">
              <li>Apply organic manure regularly</li>
              <li>Maintain proper irrigation</li>
              <li>Rotate crops seasonally</li>
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