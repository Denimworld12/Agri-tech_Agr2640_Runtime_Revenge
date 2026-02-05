import React, { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import PasskeySetup from "./PasskeySetup";
import PasskeyManagement from "./PasskeyManagement";
import {
  FARMING_EXPERIENCE_OPTIONS,
  SEASON_OPTIONS,
  SOIL_TYPE_OPTIONS,
  FARM_SIZE_OPTIONS,
  IRRIGATION_TYPE_OPTIONS,
  FARM_SIZE_UNITS,
} from "../constants/agriculturalOptions";

const Settings = ({ language = "en" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Initialize farmer data - start with empty/loading state
  const [farmerData, setFarmerData] = useState({
    name: "",
    phone: "",
    state: "",
    district: "",
    taluka: "",
    village: "",
    pincode: "",
    farmSize: "",
    farmSizeUnit: "acres",
    farmCategory: "",
    soilType: "",
    irrigationType: "",
    currentSeason: "",
    farmingExperience: "",
    mainCrops: [],
    farmer_id: "",
    language: language,
    registration_date: null,
  });

  const [dataLoading, setDataLoading] = useState(true);

  // Fetch actual farmer data from backend API
  const fetchFarmerData = async () => {
    setDataLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setDataLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const profileData = await response.json();

        // Parse total_area from backend (e.g., "4.5 acres" -> {size: "4.5", unit: "acres"})
        let parsedFarmSize = "";
        let parsedFarmUnit = "acres";
        if (profileData.total_area) {
          const areaMatch = profileData.total_area.match(/^([\d.]+)\s*(\w+)$/);
          if (areaMatch) {
            parsedFarmSize = areaMatch[1];
            parsedFarmUnit = areaMatch[2];
          }
        }

        // Map backend data to frontend state
        setFarmerData({
          name: profileData.name || "",
          phone: profileData.phone || "",
          state: profileData.state || "",
          district: profileData.district || "",
          taluka: profileData.taluka || "",
          village: profileData.village || "",
          pincode: profileData.pincode || "",
          farmSize: parsedFarmSize,
          farmSizeUnit: parsedFarmUnit,
          farmCategory: profileData.farm_category || "",
          soilType: profileData.soil_type || "",
          irrigationType: profileData.irrigation_type || "",
          currentSeason: profileData.current_season || "",
          farmingExperience: profileData.farming_experience || "",
          mainCrops: profileData.main_crops || [],
          farmer_id: profileData.farmer_id,
          language: profileData.language || language,
          registration_date: profileData.registration_date,
        });
      } else {
        console.error("Failed to fetch farmer data");
      }
    } catch (error) {
      console.error("Error fetching farmer data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch farmer data on component mount
  React.useEffect(() => {
    fetchFarmerData();
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const [editData, setEditData] = useState({ ...farmerData });

  // Translations
  const translations = {
    en: {
      title: "Farmer Settings",
      personalInfo: "Personal Information",
      farmInfo: "Farm Information",
      farmer: "Farmer",
      name: "Name",
      phone: "Phone Number",
      state: "State",
      district: "District",
      taluka: "Taluka/Tehsil",
      village: "Village/Town",
      pincode: "Pincode",
      farmSize: "Farm Size",
      farmSizeUnit: "Unit",
      acres: "Acres",
      hectares: "Hectares",
      soilType: "Soil Type",
      irrigationType: "Irrigation Type",
      currentSeason: "Current Season",
      farmingExperience: "Farming Experience (Years)",
      mainCrops: "Main Crops",
      addCrop: "Add Crop",
      editProfile: "Edit Profile",
      saveChanges: "Save Changes",
      cancel: "Cancel",
      cancelEdit: "Cancel",
      profileUpdated: "Profile updated successfully!",
      selectSeason: "Select Season",
      selectExperience: "Select Experience",
      selectSoilType: "Select soil type",
      selectIrrigation: "Select irrigation type",
      farmCategory: "Farm Category",
      selectFarmCategory: "Select category",
    },
    hi: {
      title: "किसान सेटिंग्स",
      personalInfo: "व्यक्तिगत जानकारी",
      farmInfo: "खेत की जानकारी",
      farmer: "किसान",
      name: "नाम",
      phone: "फोन नंबर",
      state: "राज्य",
      district: "जिला",
      taluka: "तालुका/तहसील",
      village: "गाँव/शहर",
      pincode: "पिनकोड",
      farmSize: "खेत का आकार",
      farmSizeUnit: "इकाई",
      acres: "एकड़",
      hectares: "हेक्टेयर",
      soilType: "मिट्टी का प्रकार",
      irrigationType: "सिंचाई का प्रकार",
      currentSeason: "वर्तमान मौसम",
      farmingExperience: "कृषि अनुभव (वर्ष)",
      mainCrops: "मुख्य फसलें",
      addCrop: "फसल जोड़ें",
      editProfile: "प्रोफाइल संपादित करें",
      saveChanges: "परिवर्तन सहेजें",
      cancel: "रद्द करें",
      cancelEdit: "रद्द करें",
      profileUpdated: "प्रोफाइल सफलतापूर्वक अपडेट हो गया!",
      selectSeason: "मौसम चुनें",
      selectExperience: "अनुभव चुनें",
      selectSoilType: "मिट्टी का प्रकार चुनें",
      selectIrrigation: "सिंचाई का प्रकार चुनें",
      farmCategory: "खेत की श्रेणी",
      selectFarmCategory: "श्रेणी चुनें",
    },
    ml: {
      title: "കർഷക ക്രമീകരണങ്ങൾ",
      personalInfo: "വ്യക്തിഗത വിവരങ്ങൾ",
      farmInfo: "കാർഷിക വിവരങ്ങൾ",
      farmer: "കർഷകൻ",
      name: "പേര്",
      phone: "ഫോൺ നമ്പർ",
      state: "സംസ്ഥാനം",
      district: "ജില്ല",
      taluka: "താലൂക്ക്/തഹസീൽ",
      village: "ഗ്രാമം/പട്ടണം",
      pincode: "പിൻകോഡ്",
      farmSize: "കൃഷിഭൂമിയുടെ വിസ്തീർണ്ണം",
      farmSizeUnit: "യൂണിറ്റ്",
      acres: "ഏക്കർ",
      hectares: "ഹെക്ടർ",
      soilType: "മണ്ണിന്റെ തരം",
      irrigationType: "ജലസേചന തരം",
      currentSeason: "നിലവിലെ സീസൺ",
      farmingExperience: "കൃഷി അനുഭവം (വർഷങ്ങൾ)",
      mainCrops: "പ്രധാന വിളകൾ",
      addCrop: "വിള ചേർക്കുക",
      editProfile: "പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക",
      saveChanges: "മാറ്റങ്ങൾ സേവ് ചെയ്യുക",
      cancel: "റദ്ദാക്കുക",
      cancelEdit: "റദ്ദാക്കുക",
      profileUpdated: "പ്രൊഫൈൽ വിജയകരമായി അപ്ഡേറ്റ് ചെയ്തു!",
      selectSeason: "സീസൺ തിരഞ്ഞെടുക്കുക",
      selectExperience: "അനുഭവം തിരഞ്ഞെടുക്കുക",
      selectSoilType: "മണ്ണിന്റെ തരം തിരഞ്ഞെടുക്കുക",
      selectIrrigation: "ജലസേചന തരം തിരഞ്ഞെടുക്കുക",
      farmCategory: "ഫാം വിഭാഗം",
      selectFarmCategory: "വിഭാഗം തിരഞ്ഞെടുക്കുക",
    },
  };

  const t = translations[language] || translations.en;

  // Indian States
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Puducherry",
    "Chandigarh",
    "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
  ];

  // Talukas/Districts based on selected state
  const getDistrictsAndTalukas = (state) => {
    const locationData = {
      Kerala: {
        districts: [
          "Thiruvananthapuram",
          "Kollam",
          "Pathanamthitta",
          "Alappuzha",
          "Kottayam",
          "Idukki",
          "Ernakulam",
          "Thrissur",
          "Palakkad",
          "Malappuram",
          "Kozhikode",
          "Wayanad",
          "Kannur",
          "Kasaragod",
        ],
        talukas: {
          Kollam: ["Kollam", "Karunagappally", "Kunnathur", "Kottarakkara"],
          Thiruvananthapuram: [
            "Thiruvananthapuram",
            "Chirayinkeezhu",
            "Neyyattinkara",
          ],
          Ernakulam: ["Kochi", "Aluva", "Kanayannur", "Paravur", "Kunnathunad"],
          Thrissur: ["Thrissur", "Mukundapuram", "Chavakkad", "Thalappilly"],
          Palakkad: ["Palakkad", "Chittur", "Alathur", "Ottappalam"],
          Kozhikode: ["Kozhikode", "Vatakara", "Koyilandy", "Thamarassery"],
          Kannur: ["Kannur", "Thalassery", "Iritty", "Taliparamba"],
          Kottayam: [
            "Kottayam",
            "Vaikom",
            "Meenachil",
            "Changanassery",
            "Kanjirappally",
          ],
        },
      },
      "Tamil Nadu": {
        districts: [
          "Chennai",
          "Coimbatore",
          "Madurai",
          "Tiruchirappalli",
          "Salem",
          "Tirunelveli",
          "Tiruppur",
          "Vellore",
          "Erode",
          "Thanjavur",
          "Dindigul",
          "Cuddalore",
        ],
        talukas: {
          Chennai: ["Chennai North", "Chennai South", "Chennai Central"],
          Coimbatore: [
            "Coimbatore North",
            "Coimbatore South",
            "Pollachi",
            "Mettupalayam",
          ],
          Madurai: ["Madurai North", "Madurai South", "Melur", "Usilampatti"],
        },
      },
      Karnataka: {
        districts: [
          "Bengaluru Urban",
          "Bengaluru Rural",
          "Mysuru",
          "Tumakuru",
          "Kolar",
          "Chikkaballapura",
          "Hassan",
          "Dakshina Kannada",
          "Udupi",
          "Uttara Kannada",
          "Shivamogga",
        ],
        talukas: {
          "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Anekal"],
          Mysuru: ["Mysuru", "Nanjangud", "Hunsur", "Piriyapatna"],
          Hassan: ["Hassan", "Arsikere", "Holenarasipur", "Sakleshpur"],
        },
      },
      Maharashtra: {
        districts: [
          "Mumbai",
          "Pune",
          "Nagpur",
          "Nashik",
          "Aurangabad",
          "Solapur",
          "Amravati",
          "Kolhapur",
          "Satara",
          "Sangli",
          "Ahmednagar",
          "Latur",
        ],
        talukas: {
          Pune: ["Pune City", "Haveli", "Mulshi", "Maval", "Bhor", "Purandar"],
          Mumbai: ["Mumbai City", "Mumbai Suburban"],
          Nashik: ["Nashik", "Malegaon", "Sinnar", "Niphad", "Dindori"],
        },
      },
      Gujarat: {
        districts: [
          "Ahmedabad",
          "Surat",
          "Vadodara",
          "Rajkot",
          "Bhavnagar",
          "Jamnagar",
          "Junagadh",
          "Gandhinagar",
          "Anand",
          "Bharuch",
          "Mehsana",
        ],
        talukas: {
          Ahmedabad: [
            "Ahmedabad City",
            "Ahmedabad Rural",
            "Daskroi",
            "Detroj-Rampura",
          ],
          Surat: ["Surat City", "Chorasi", "Palsana", "Kamrej", "Olpad"],
          Vadodara: ["Vadodara", "Savli", "Vaghodia", "Padra"],
        },
      },
    };
    return locationData[state] || { districts: [], talukas: {} };
  };

  // Get available districts for selected state
  const availableDistricts = getDistrictsAndTalukas(
    editData.state || farmerData.state
  ).districts;

  // Get available talukas for selected district
  const availableTalukas =
    getDistrictsAndTalukas(editData.state || farmerData.state).talukas[
    editData.district || farmerData.district
    ] || [];

  // Get standardized options based on language
  const soilTypeOptions = Object.values(SOIL_TYPE_OPTIONS).map((option) => ({
    value: option.value,
    label:
      language === "hi"
        ? option.hiLabel
        : language === "ml"
          ? option.mlLabel
          : option.label,
  }));

  const irrigationTypeOptions = Object.values(IRRIGATION_TYPE_OPTIONS).map(
    (option) => ({
      value: option.value,
      label:
        language === "hi"
          ? option.hiLabel
          : language === "ml"
            ? option.mlLabel
            : option.label,
    })
  );

  const currentSeasonOptions = Object.values(SEASON_OPTIONS).map((option) => ({
    value: option.value,
    label:
      language === "hi"
        ? option.hiLabel
        : language === "ml"
          ? option.mlLabel
          : option.label,
  }));

  const farmingExperienceOptions = Object.values(
    FARMING_EXPERIENCE_OPTIONS
  ).map((option) => ({
    value: option.value,
    label:
      language === "hi"
        ? option.hiLabel
        : language === "ml"
          ? option.mlLabel
          : option.label,
  }));

  const farmSizeOptions = Object.values(FARM_SIZE_OPTIONS).map((option) => ({
    value: option.value,
    label:
      language === "hi"
        ? option.hiLabel
        : language === "ml"
          ? option.mlLabel
          : option.label,
  }));

  const farmSizeUnitOptions = Object.values(FARM_SIZE_UNITS).map((option) => ({
    value: option.value,
    label:
      language === "hi"
        ? option.hiLabel
        : language === "ml"
          ? option.mlLabel
          : option.label,
  }));

  // Handle profile image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCropAdd = () => {
    const newCrop = prompt("Enter crop name:");
    if (newCrop && !editData.mainCrops.includes(newCrop)) {
      setEditData((prev) => ({
        ...prev,
        mainCrops: [...prev.mainCrops, newCrop],
      }));
    }
  };

  const handleCropRemove = (cropToRemove) => {
    setEditData((prev) => ({
      ...prev,
      mainCrops: prev.mainCrops.filter((crop) => crop !== cropToRemove),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveMessage("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSaveMessage("❌ Please login first");
        setLoading(false);
        return;
      }

      // Update profile via API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editData.name,
          district: editData.district,
          village: editData.village,
          state: editData.state,
          taluka: editData.taluka,
          pincode: editData.pincode,
          farm_size: editData.farmSize,
          farm_size_unit: editData.farmSizeUnit,
          farm_category: editData.farmCategory,
          soil_type: editData.soilType,
          irrigation_type: editData.irrigationType,
          current_season: editData.currentSeason,
          farming_experience: editData.farmingExperience,
          main_crops: editData.mainCrops,
        }),
      });

      if (response.ok) {
        await response.json(); // Response processed successfully
        setFarmerData({ ...editData });
        setIsEditing(false);
        setSaveMessage("✅ " + t.profileUpdated);

        // Update localStorage with new data
        const storedData = localStorage.getItem("farmerData");
        if (storedData) {
          const parsed = JSON.parse(storedData);
          localStorage.setItem(
            "farmerData",
            JSON.stringify({
              ...parsed,
              name: editData.name,
              district: editData.district,
            })
          );
        }
      } else {
        const errorData = await response.json();
        setSaveMessage(
          "❌ Failed to update: " + (errorData.detail || "Unknown error")
        );
      }
    } catch (error) {
      setSaveMessage("❌ Network error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...farmerData });
    setIsEditing(false);
  };

  // Show loading state while fetching data
  if (dataLoading) {
    return (
      <div data-theme="lemonade" className="p-6 bg-base-200 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
              <p className="text-base-content/70 font-bold">
                {language === "hi"
                  ? "आपकी प्रोफ़ाइल लोड हो रही है..."
                  : language === "ml"
                    ? "നിങ്ങളുടെ പ്രൊഫൈൽ ലോഡ് ചെയ്യുന്നു..."
                    : "Loading your profile..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="lemonade" className="p-4 md:p-6 bg-base-200 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#064e3b] uppercase tracking-tight">{t.title}</h1>
            {farmerData.farmer_id && (
              <div className="badge badge-outline border-[#064e3b]/30 text-[#064e3b] font-mono mt-1">
                ID: {farmerData.farmer_id}
              </div>
            )}
          </div>
          <div className="flex shrink-0">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="btn bg-[#064e3b] hover:bg-[#053d2e] text-white border-none shadow-md px-6"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                {t.editProfile}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn btn-success text-white shadow-md border-none px-6"
                >
                  {loading ? <span className="loading loading-spinner loading-xs"></span> : <span className="material-symbols-outlined text-sm">check_circle</span>}
                  {t.saveChanges}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={loading}
                  className="btn btn-ghost bg-base-300 hover:bg-base-400 border-none px-4"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  {t.cancelEdit}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`alert shadow-lg rounded-xl ${saveMessage.includes("✅") || saveMessage.includes("Success")
                ? "alert-success text-white"
                : "alert-error text-white"
              }`}
          >
            <span className="material-symbols-outlined">
              {saveMessage.includes("✅") ? "verified" : "report"}
            </span>
            <span className="font-bold">{saveMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Personal Information */}
          <Card className="bg-base-100 shadow-xl border border-base-300 overflow-hidden">
            <div className="bg-[#064e3b] p-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#bef264]">person</span>
              <h2 className="text-white font-black uppercase text-xs tracking-widest">
                {t.personalInfo}
              </h2>
            </div>

            <div className="p-6">
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-base-200">
                <div className="relative">
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-full ring ring-[#bef264] ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-200">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-base-content/20">
                          <span className="material-symbols-outlined text-5xl">account_circle</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-1 -right-1 btn btn-circle btn-primary btn-sm border-none shadow-lg cursor-pointer hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xs">add_a_photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-2xl font-black text-[#064e3b]">
                    {farmerData.name}
                  </h3>
                  <p className="text-base-content/60 font-bold uppercase text-[10px] tracking-widest">{t.farmer}</p>
                  <p className="text-sm font-medium opacity-70 flex items-center justify-center sm:justify-start gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {farmerData.district || "District"}, {farmerData.state}
                  </p>
                  {farmerData.registration_date && (
                    <p className="text-[10px] font-bold opacity-40 uppercase">
                      Member since: {new Date(farmerData.registration_date).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                    <div className="badge badge-info badge-outline font-bold text-[10px] uppercase py-3">
                      Lang: {farmerData.language?.toUpperCase() || "EN"}
                    </div>
                    {farmerData.phone && (
                      <div className="badge badge-success text-white font-bold text-[10px] uppercase py-3 gap-1">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Verified
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.name}</Label>
                  {isEditing ? (
                    <input
                      className="input input-bordered w-full h-12"
                      value={editData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.name}</p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.phone}</Label>
                  {isEditing ? (
                    <div className="space-y-1">
                      <input
                        className="input input-bordered w-full h-12 bg-base-200 cursor-not-allowed"
                        value={editData.phone}
                        disabled
                      />
                      <p className="text-[9px] font-bold text-base-content/40 uppercase pl-1">
                        Locked for security
                      </p>
                    </div>
                  ) : (
                    <p className="text-base-content font-black pl-1 flex items-center gap-2">
                      {farmerData.phone}
                      <span className="material-symbols-outlined text-success text-sm">verified</span>
                    </p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.village}</Label>
                  {isEditing ? (
                    <input
                      className="input input-bordered w-full h-12"
                      value={editData.village}
                      onChange={(e) => handleInputChange("village", e.target.value)}
                    />
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.village}</p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.state}</Label>
                  {isEditing ? (
                    <select
                      value={editData.state}
                      onChange={(e) => {
                        handleInputChange("state", e.target.value);
                        handleInputChange("district", "");
                        handleInputChange("taluka", "");
                      }}
                      className="select select-bordered w-full h-12"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.state}</p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.district}</Label>
                  {isEditing ? (
                    <select
                      value={editData.district}
                      onChange={(e) => {
                        handleInputChange("district", e.target.value);
                        handleInputChange("taluka", "");
                      }}
                      className="select select-bordered w-full h-12"
                      disabled={!editData.state}
                    >
                      <option value="">Select District</option>
                      {availableDistricts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.district}</p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.taluka}</Label>
                  {isEditing ? (
                    <select
                      value={editData.taluka}
                      onChange={(e) => handleInputChange("taluka", e.target.value)}
                      className="select select-bordered w-full h-12"
                      disabled={!editData.district}
                    >
                      <option value="">Select Taluka</option>
                      {availableTalukas.map((taluka) => (
                        <option key={taluka} value={taluka}>{taluka}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.taluka}</p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.pincode}</Label>
                  {isEditing ? (
                    <input
                      className="input input-bordered w-full h-12"
                      value={editData.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                    />
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.pincode}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="bg-base-100 shadow-xl border border-base-300 overflow-hidden">
            <div className="bg-[#064e3b] p-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#bef264]">security</span>
              <h2 className="text-white font-black uppercase text-xs tracking-widest">
                Security Settings
              </h2>
            </div>
            <div className="p-6">
              <PasskeySetup
                onPasskeyCreated={(data) => {
                  console.log("Passkey created successfully:", data);
                  window.location.reload();
                }}
                language={language}
              />
              <div className="divider my-8 opacity-20"></div>
              <PasskeyManagement language={language} />
            </div>
          </Card>

          {/* Farm Information */}
          <Card className="bg-base-100 shadow-xl border border-base-300 overflow-hidden">
            <div className="bg-[#064e3b] p-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#bef264]">agriculture</span>
              <h2 className="text-white font-black uppercase text-xs tracking-widest">
                {t.farmInfo}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.farmSize}</Label>
                  {isEditing ? (
                    <div className="join w-full">
                      <input
                        className="input input-bordered join-item w-full h-12"
                        value={editData.farmSize}
                        onChange={(e) => handleInputChange("farmSize", e.target.value)}
                        type="number"
                        placeholder="Area"
                      />
                      <select
                        value={editData.farmSizeUnit}
                        onChange={(e) => handleInputChange("farmSizeUnit", e.target.value)}
                        className="select select-bordered join-item h-12 bg-base-200"
                      >
                        {farmSizeUnitOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-base-content font-black pl-1">
                      {farmerData.farmSize} {farmerData.farmSizeUnit}
                    </p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.farmCategory}</Label>
                  {isEditing ? (
                    <select
                      value={editData.farmCategory || ""}
                      onChange={(e) => handleInputChange("farmCategory", e.target.value)}
                      className="select select-bordered w-full h-12"
                    >
                      <option value="">{t.selectFarmCategory}</option>
                      {farmSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.farmCategory || "-"}</p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.soilType}</Label>
                  {isEditing ? (
                    <select
                      value={editData.soilType}
                      onChange={(e) => handleInputChange("soilType", e.target.value)}
                      className="select select-bordered w-full h-12"
                    >
                      <option value="">{t.selectSoilType}</option>
                      {soilTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.soilType}</p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.irrigationType}</Label>
                  {isEditing ? (
                    <select
                      value={editData.irrigationType}
                      onChange={(e) => handleInputChange("irrigationType", e.target.value)}
                      className="select select-bordered w-full h-12"
                    >
                      <option value="">{t.selectIrrigation}</option>
                      {irrigationTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.irrigationType}</p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.currentSeason}</Label>
                  {isEditing ? (
                    <select
                      value={editData.currentSeason}
                      onChange={(e) => handleInputChange("currentSeason", e.target.value)}
                      className="select select-bordered w-full h-12"
                    >
                      <option value="">{t.selectSeason}</option>
                      {currentSeasonOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.currentSeason}</p>
                  )}
                </div>

                <div className="form-control">
                  <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-1">{t.farmingExperience}</Label>
                  {isEditing ? (
                    <select
                      value={editData.farmingExperience}
                      onChange={(e) => handleInputChange("farmingExperience", e.target.value)}
                      className="select select-bordered w-full h-12"
                    >
                      <option value="">{t.selectExperience}</option>
                      {farmingExperienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-base-content font-black pl-1">{farmerData.farmingExperience}</p>
                  )}
                </div>
              </div>

              {/* Main Crops */}
              <div className="mt-8 pt-6 border-t border-base-200">
                <Label className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-3 block">
                  {t.mainCrops}
                </Label>
                {isEditing ? (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {editData.mainCrops.map((crop, index) => (
                        <div
                          key={index}
                          className="badge bg-[#064e3b] text-white p-4 font-bold border-none gap-2 hover:scale-105 transition-transform"
                        >
                          <span>{crop}</span>
                          <button
                            onClick={() => handleCropRemove(crop)}
                            className="hover:text-red-300 flex items-center"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleCropAdd}
                      className="btn btn-outline btn-primary btn-sm h-10 border-dashed gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      {t.addCrop}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {farmerData.mainCrops.map((crop, index) => (
                      <div
                        key={index}
                        className="badge bg-[#064e3b] text-white p-4 font-bold border-none"
                      >
                        {crop}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Footer info */}
        {!isEditing && (
          <div className="text-center opacity-30 mt-4 pb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">
              Secure Farmer Dashboard v1.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
