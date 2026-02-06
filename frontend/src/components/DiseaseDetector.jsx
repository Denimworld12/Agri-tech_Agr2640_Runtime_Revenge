import { useState, useRef } from "react";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Button } from "./ui/Button";

function DiseaseDetector({ language }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        setError("");

        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setError(
          language === "ml"
            ? "ദയവായി ഒരു ചിത്രം ഫയൽ തിരഞ്ഞെടുക്കുക"
            : language === "hi"
              ? "कृपया एक छवि फाइल चुनें"
              : "Please select an image file"
        );
      }
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError(
        language === "ml"
          ? "ദയവായി ഒരു ചിത്രം അപ്ലോഡ് ചെയ്യുക"
          : language === "hi"
            ? "कृपया एक छवि अपलोड करें"
            : "Please upload an image"
      );
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", selectedImage);

      // Call the ML prediction API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/predict`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze image");
      }

      const data = await response.json();

      // Transform ML model response to match frontend expectations
      const diseaseMap = {
        'BacterialBlights': {
          name: 'Bacterial Blights',
          severity: 'severe',
          treatment: 'Apply copper-based bactericides. Remove infected leaves immediately.',
          prevention: 'Use disease-free seeds, avoid overhead irrigation, maintain proper spacing'
        },
        'Healthy': {
          name: 'Healthy Plant',
          severity: 'none',
          treatment: 'No treatment needed. Continue regular care.',
          prevention: 'Maintain good agricultural practices'
        },
        'Mosaic': {
          name: 'Mosaic Virus',
          severity: 'moderate',
          treatment: 'Remove infected plants, control aphid population using neem oil or insecticides.',
          prevention: 'Use virus-free seeds, control insect vectors, remove weeds'
        },
        'RedRot': {
          name: 'Red Rot Disease',
          severity: 'severe',
          treatment: 'Apply fungicides, remove and burn infected plants, use resistant varieties.',
          prevention: 'Crop rotation, proper drainage, use healthy seed material'
        },
        'Rust': {
          name: 'Rust Disease',
          severity: 'moderate',
          treatment: 'Apply fungicides like mancozeb or sulfur-based products.',
          prevention: 'Ensure good air circulation, avoid overhead watering, remove infected leaves'
        },
        'Yellow': {
          name: 'Yellow Disease',
          severity: 'moderate',
          treatment: 'Check for nutrient deficiency, apply balanced fertilizers.',
          prevention: 'Regular soil testing, proper fertilization, maintain soil pH'
        }
      };

      const diseaseInfo = diseaseMap[data.prediction] || diseaseMap['Healthy'];

      const formattedResult = {
        disease: diseaseInfo.name,
        crop: 'Sugarcane', // Model is trained on sugarcane
        confidence: Math.round(data.confidence),
        severity: diseaseInfo.severity,
        treatment: diseaseInfo.treatment,
        prevention: diseaseInfo.prevention,
        model_available: true,
        raw_prediction: data.prediction
      };

      setResult(formattedResult);
    } catch (error) {
      console.error("Disease detection error:", error);
      setError(
        language === "ml"
          ? "ചിത്രം വിശകലനം ചെയ്യുന്നതിൽ പിശക്: " + error.message
          : language === "hi"
            ? "छवि विश्लेषण में त्रुटि: " + error.message
            : "Error analyzing image: " + error.message
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const resetDetector = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "severe":
        return "text-red-600 bg-red-50 border-red-200";
      case "moderate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "mild":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "none":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case "severe":
        return language === "ml"
          ? "ഗുരുതരം"
          : language === "hi"
            ? "गंभीर"
            : "Severe";
      case "moderate":
        return language === "ml"
          ? "മാധ്യമിക"
          : language === "hi"
            ? "मध्यम"
            : "Moderate";
      case "mild":
        return language === "ml"
          ? "നേരിയ"
          : language === "hi"
            ? "हल्का"
            : "Mild";
      case "none":
        return language === "ml"
          ? "ഇല്ല"
          : language === "hi"
            ? "कोई नहीं"
            : "None";
      default:
        return severity;
    }
  };

  return (
    <div data-theme="lemonade" className="p-4 md:p-6 bg-base-200 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-[#064e3b] mb-2 flex items-center gap-3">
            {language === "ml"
              ? "വിള രോഗ നിർണയം"
              : language === "hi"
                ? "फसल रोग डिटेक्टर"
                : "Crop Disease Detector"}
            <span className="material-symbols-outlined text-3xl">biotech</span>
          </h1>
          <p className="text-base-content/60 font-medium">
            {language === "ml"
              ? "വിള രോഗങ്ങൾ തിരിച്ചറിയാനും ചികിത്സാ നിർദ്ദേശങ്ങൾ നേടാനും AI ഉപയോഗിക്കുക"
              : language === "hi"
                ? "फसल रोगों की पहचान और उपचार सुझाव पाने के लिए AI का उपयोग करें"
                : "Use AI to identify crop diseases and get treatment recommendations"}
          </p>
        </div>

        {/* Image Upload Section */}
        <Card className="mb-6 border border-base-300 shadow-xl bg-base-100 overflow-hidden">
          <div className="bg-[#064e3b] p-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#bef264]">upload_file</span>
            <h2 className="text-white font-black uppercase text-xs tracking-widest">
              {language === "ml" ? "ചിത്ര अपलोड करें" : language === "hi" ? "छवि अपलोड करें" : "Upload Image"}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="form-control">
              <Label htmlFor="image-upload" className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-2">
                {language === "ml"
                  ? "വിള/ഇലയുടെ ഫോട്ടോ തിരഞ്ഞെടുക്കുക"
                  : language === "hi"
                    ? "फसल/पत्ती की फोटो चुनें"
                    : "Select Crop/Leaf Photo"}
              </Label>
              <Input
                ref={fileInputRef}
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input file-input-bordered w-full"
              />
              <p className="text-[10px] font-bold text-base-content/40 mt-2 uppercase tracking-tight">
                {language === "ml"
                  ? "JPG, PNG, या WEBP (പരമാവധി 10MB)"
                  : language === "hi"
                    ? "JPG, PNG, या WEBP (अधिकतम 10MB)"
                    : "JPG, PNG, or WEBP (Max 10MB)"}
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4 animate-in fade-in zoom-in-95 duration-300">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] mb-2">
                  {language === "ml" ? "പ്രിവ്യൂ:" : language === "hi" ? "पूर्वावलोकन:" : "Preview:"}
                </p>
                <div className="relative w-full max-w-md mx-auto">
                  <img
                    src={imagePreview}
                    alt="Uploaded crop"
                    className="w-full h-64 object-cover rounded-2xl border-4 border-base-200 shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                onClick={analyzeImage}
                disabled={!selectedImage || analyzing}
                className="btn bg-[#064e3b] hover:bg-[#053d2e] text-white flex-1 h-14 text-lg font-bold border-none shadow-lg"
              >
                {analyzing ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    {language === "ml"
                      ? "വിശകലനം ചെയ്യുന്നു..."
                      : language === "hi"
                        ? "विश्लेषण कर रहे हैं..."
                        : "Analyzing..."}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#bef264]">search_check</span>
                    {language === "ml" ? "രോഗം കണ്ടെത്തുക" : language === "hi" ? "रोग का पता लगाएं" : "Detect Disease"}
                  </div>
                )}
              </Button>

              <Button
                onClick={resetDetector}
                variant="outline"
                className="btn btn-ghost border-base-300 h-14 px-8 font-bold text-[#064e3b]"
              >
                <span className="material-symbols-outlined mr-2">restart_alt</span>
                {language === "ml" ? "പുനഃസജ്ജീകരിക്കുക" : language === "hi" ? "रीसेट" : "Reset"}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-error">report</span>
              <p className="text-error text-xs font-bold uppercase">{error}</p>
            </div>
          )}
        </Card>

        {/* Results Section */}
        {result && (
          <Card className="border-t-4 border-t-[#064e3b] shadow-2xl animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-black text-[#064e3b] flex items-center gap-2 uppercase tracking-tight">
                <span className="material-symbols-outlined">assignment_turned_in</span>
                {language === "ml" ? "നിർണയ ഫലം" : language === "hi" ? "निदान परिणाम" : "Detection Results"}
              </h2>

              <div className="space-y-6">
                {/* Disease Name & Confidence */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-base-200 rounded-2xl gap-4 border border-base-300">
                  <div className="space-y-1">
                    <h3 className="font-black text-2xl text-[#064e3b] leading-tight">
                      {result.disease}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.crop && (
                        <span className="badge badge-primary font-bold text-[10px] py-3">
                          {language === "ml" ? "വിള: " : language === "hi" ? "फसल: " : "Crop: "} {result.crop}
                        </span>
                      )}
                      <span className="badge badge-outline border-[#064e3b]/30 text-[#064e3b] font-bold text-[10px] py-3">
                        {language === "ml" ? "വിശ്വാസ്യത: " : language === "hi" ? "विश्वसनीयता: " : "Confidence: "} {result.confidence}%
                      </span>
                    </div>
                  </div>
                  <div className={`badge badge-lg font-black p-5 border-none shadow-sm uppercase tracking-widest text-[10px] ${getSeverityColor(result.severity)}`}>
                    {getSeverityText(result.severity)}
                  </div>
                </div>

                {/* Treatment Recommendations */}
                <div className="group">
                  <h4 className="label-text font-black uppercase text-[11px] tracking-[0.2em] text-[#064e3b]/60 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">medication</span>
                    {language === "ml" ? "ചികിത്സാ നിർദ്ദേശങ്ങൾ:" : language === "hi" ? "उपचार सुझाव:" : "Treatment Recommendations:"}
                  </h4>
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
                    <p className="text-blue-900 text-sm font-medium leading-relaxed">{result.treatment}</p>
                  </div>
                </div>

                {/* Prevention Tips */}
                <div>
                  <h4 className="label-text font-black uppercase text-[11px] tracking-[0.2em] text-[#064e3b]/60 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">shield</span>
                    {language === "ml" ? "പ്രതിരോധ നുറുങ്ങുകൾ:" : language === "hi" ? "रोकथाम के सुझाव:" : "Prevention Tips:"}
                  </h4>
                  <div className="p-5 bg-[#bef264]/10 border border-[#bef264]/30 rounded-2xl shadow-sm">
                    <p className="text-[#064e3b] text-sm font-bold leading-relaxed">{result.prevention}</p>
                  </div>
                </div>

                {/* Model Status */}
                {result.model_available === false && (
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-warning">info</span>
                    <p className="text-[11px] text-warning-content font-bold uppercase leading-tight">
                      <strong>{language === "ml" ? "ശ്രദ്ധിക്കുക: " : language === "hi" ? "ध्यान दें: " : "Note: "}</strong>
                      {language === "ml"
                        ? "AI മോഡൽ ലോഡ് ചെയ്തിട്ടില്ല, ഡെമോ ഫലം കാണിക്കുന്നു."
                        : language === "hi"
                          ? "AI मॉडल लोड नहीं है, डेमो परिणाम दिख रहा है।"
                          : "AI model not loaded, showing demo result."}
                    </p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="p-4 bg-base-200 border border-base-300 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-base-content/40 mt-0.5">verified_user</span>
                  <p className="text-[10px] text-base-content/60 font-bold uppercase leading-relaxed">
                    <strong>{language === "ml" ? "അറിയിപ്പ്: " : language === "hi" ? "अस्वीकरण: " : "Disclaimer: "}</strong>
                    {language === "ml"
                      ? "ഈ AI നിർണയം ഒരു പ്രാഥമിക വിലയിരുത്തൽ മാത്രമാണ്. ഗുരുതരമായ പ്രശ്നങ്ങൾക്ക് കാർഷിക വിദഗ്ധനെ സമീപിക്കുക."
                      : language === "hi"
                        ? "यह AI निदान केवल एक प्रारंभिक मूल्यांकन है। गंभीर समस्याओं के लिए कृषि विशेषज्ञ से संपर्क करें।"
                        : "This AI diagnosis is only a preliminary assessment. For serious issues, consult with agricultural experts."}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* How it Works */}
        <Card className="mt-8 border border-base-300 bg-base-100/50">
          <div className="p-8">
            <h2 className="text-sm font-black text-[#064e3b] uppercase tracking-[0.3em] mb-8 text-center opacity-40">
              {language === "ml" ? "എങ്ങനെ ഉപയോഗിക്കാം" : language === "hi" ? "इसका उपयोग कैसे करें" : "How to Use"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="text-center group">
                <div className="w-16 h-16 bg-[#064e3b] text-[#bef264] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <h3 className="font-black text-[#064e3b] text-xs uppercase tracking-widest mb-2">
                  {language === "ml" ? "1. ഫോട്ടോ എടുക്കുക" : language === "hi" ? "1. फोटो लें" : "1. Take Photo"}
                </h3>
                <p className="text-[11px] font-bold text-base-content/50 leading-relaxed px-4">
                  {language === "ml"
                    ? "രോഗബാധിതമായ ഇലയുടെയോ ചെടിയുടെയോ വ്യക്തമായ ഫോട്ടോ എടുക്കുക"
                    : language === "hi"
                      ? "संक्रमित पत्ती या पौधे की स्पष्ट तस्वीर लें"
                      : "Take clear photo of affected leaf or plant"}
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-[#064e3b] text-[#bef264] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">memory</span>
                </div>
                <h3 className="font-black text-[#064e3b] text-xs uppercase tracking-widest mb-2">
                  {language === "ml" ? "2. AI വിശകലനം" : language === "hi" ? "2. AI विश्लेषण" : "2. AI Analysis"}
                </h3>
                <p className="text-[11px] font-bold text-base-content/50 leading-relaxed px-4">
                  {language === "ml"
                    ? "നമ്മുടെ AI സിസ്റ്റം ചിത്രം വിശകലനം ചെയ്ത് രോഗം തിരിച്ചറിയുന്നു"
                    : language === "hi"
                      ? "हमारा AI सिस्टम छवि का विश्लेषण करके रोग की पहचान करता है"
                      : "Our AI system analyzes the image and identifies diseases"}
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-[#064e3b] text-[#bef264] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">medication_liquid</span>
                </div>
                <h3 className="font-black text-[#064e3b] text-xs uppercase tracking-widest mb-2">
                  {language === "ml" ? "3. ചികിത്സ നേടുക" : language === "hi" ? "3. उपचार प्राप्त करें" : "3. Get Treatment"}
                </h3>
                <p className="text-[11px] font-bold text-base-content/50 leading-relaxed px-4">
                  {language === "ml"
                    ? "വിശദമായ ചികിത്സാ നിർദ്ദേശങ്ങളും പ്രതിരോധ നുറുങ്ങുകളും നേടുക"
                    : language === "hi"
                      ? "विस्तृत उपचार सुझाव और रोकथाम युक्तियां प्राप्त करें"
                      : "Get detailed treatment recommendations and prevention tips"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DiseaseDetector;