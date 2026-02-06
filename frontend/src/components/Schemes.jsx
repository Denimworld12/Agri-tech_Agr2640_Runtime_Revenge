import React, { useState, useEffect } from "react";

// Inline Card Component
const Card = ({ children, className = "" }) => {
  return <div className={`rounded-lg ${className}`}>{children}</div>;
};

// Helper to safely render field values (string, object, array)
const renderField = (field, opts = {}) => {
  if (typeof field === "string") {
    if (opts.maxLen && field.length > opts.maxLen) {
      return field.substring(0, opts.maxLen) + "...";
    }
    return field;
  } else if (Array.isArray(field)) {
    return field.join(", ");
  } else if (typeof field === "object" && field !== null) {
    return Object.entries(field)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        } else if (typeof value === "object" && value !== null) {
          return `${key}: { ${Object.entries(value)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(", ")} }`;
        } else {
          return `${key}: ${value}`;
        }
      })
      .join("; ");
  } else if (field !== undefined && field !== null) {
    return String(field);
  }
  return "";
};

// Detailed View Modal Component
const SchemeDetailModal = ({ scheme, language, onClose, onToggleBookmark, isBookmarked }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!scheme) return null;

  const getText = (key) => {
    const texts = {
      overview: { en: "Overview", hi: "अवलोकन", ml: "അവലോകനം" },
      eligibility: { en: "Eligibility", hi: "पात्रता", ml: "യോഗ്യത" },
      application: { en: "Application", hi: "आवेदन", ml: "അപേക്ഷ" },
      documents: { en: "Documents", hi: "दस्तावेज़", ml: "രേഖകൾ" },
      schemeDetails: { en: "Scheme Details", hi: "योजना विवरण", ml: "പദ്ധതി വിശദാംശങ്ങൾ" },
      benefits: { en: "Benefits & Financial Assistance", hi: "लाभ और वित्तीय सहायता", ml: "ആനുകൂല്യങ്ങളും സാമ്പത്തിക സഹായവും" },
      applicationProcess: { en: "Application Process", hi: "आवेदन प्रक्रिया", ml: "അപേക്ഷാ പ്രക്രിയ" },
      requiredDocuments: { en: "Required Documents", hi: "आवश्यक दस्तावेज़", ml: "ആവശ്യമായ രേഖകൾ" },
      eligibilityCriteria: { en: "Eligibility Criteria", hi: "पात्रता मानदंड", ml: "യോഗ്യതാ മാനദണ്ഡങ്ങൾ" },
      schemeInformation: { en: "Scheme Information", hi: "योजना जानकारी", ml: "പദ്ധതി വിവരങ്ങൾ" },
      schemeLevel: { en: "Scheme Level", hi: "योजना स्तर", ml: "പദ്ധതി നില" },
      categories: { en: "Categories", hi: "श्रेणियां", ml: "വിഭാഗങ്ങൾ" },
      lastUpdated: { en: "Last Updated", hi: "अंतिम अपडेट", ml: "അവസാനം അപ്ഡേറ്റ് ചെയ്തത്" },
      schemeId: { en: "Scheme ID", hi: "योजना आईडी", ml: "പദ്ധതി ഐഡി" },
      backToSearch: { en: "Back to Search", hi: "खोज पर वापस जाएं", ml: "തിരയലിലേക്ക് മടങ്ങുക" },
      share: { en: "Share", hi: "साझा करें", ml: "പങ്കിടുക" },
      save: { en: "Save", hi: "सहेजें", ml: "സേവ് ചെയ്യുക" },
      saved: { en: "Saved", hi: "सहेजा गया", ml: "സംരക്ഷിച്ചു" },
      stateGovernment: { en: "State Government Scheme", hi: "राज्य सरकार योजना", ml: "സംസ്ഥാന സർക്കാർ പദ്ധതി" },
      step: { en: "Step", hi: "चरण", ml: "ഘട്ടം" },
    };
    return texts[key]?.[language] || texts[key]?.en || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                {getText("backToSearch")}
              </button>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded font-medium">
                  <span className="material-symbols-outlined">share</span>
                  {getText("share")}
                </button>
                <button
                  onClick={() => onToggleBookmark(scheme)}
                  className={`px-4 py-2 flex items-center gap-2 rounded font-medium ${isBookmarked
                    ? "btn-primary"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <span className="material-symbols-outlined">bookmark</span>
                  {isBookmarked ? getText("saved") : getText("save")}
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {scheme.scheme_name?.[language] || scheme.scheme_name?.en}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {getText("stateGovernment")}
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                {getText("lastUpdated")}: {formatDate(scheme.updatedAt)}
              </div>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-2">
              {scheme.schemeCategory?.[language]?.map((cat, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs and Content */}
          <div className="flex flex-col md:flex-row">
            {/* Main Content */}
            <div className="flex-1">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 px-6">
                <div className="flex gap-1 overflow-x-auto">
                  {["overview", "eligibility", "application", "documents"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === tab
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      {getText(tab)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-gray-700">description</span>
                        <h2 className="text-xl font-bold text-gray-900">{getText("schemeDetails")}</h2>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {scheme.details?.[language] || scheme.details?.en}
                      </p>
                    </div>

                    {scheme.benefits && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-gray-700">payments</span>
                          <h2 className="text-xl font-bold text-gray-900">{getText("benefits")}</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {scheme.benefits?.[language] || scheme.benefits?.en}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "eligibility" && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-gray-700">verified</span>
                      <h2 className="text-xl font-bold text-gray-900">{getText("eligibilityCriteria")}</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {scheme.eligibility?.[language] || scheme.eligibility?.en}
                    </p>
                  </div>
                )}

                {activeTab === "application" && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-gray-700">task_alt</span>
                      <h2 className="text-xl font-bold text-gray-900">{getText("applicationProcess")}</h2>
                    </div>
                    <div className="space-y-4">
                      {(scheme.application?.[language] || scheme.application?.en || []).map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-gray-700">description</span>
                      <h2 className="text-xl font-bold text-gray-900">{getText("requiredDocuments")}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(scheme.documents?.[language] || scheme.documents?.en || []).map((doc, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="material-symbols-outlined text-green-600 flex-shrink-0">check_circle</span>
                          <p className="text-gray-700 text-sm">{doc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Scheme Information */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{getText("schemeInformation")}</h3>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">{getText("schemeLevel")}</p>
                  <p className="text-gray-900 font-medium">{scheme.level || "State Government"}</p>
                </div>

                {scheme.schemeCategory?.[language] && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{getText("categories")}</p>
                    <div className="flex flex-wrap gap-2">
                      {scheme.schemeCategory[language].map((cat, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">{getText("lastUpdated")}</p>
                  <p className="text-gray-900">{formatDate(scheme.updatedAt)}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">{getText("schemeId")}</p>
                  <p className="text-gray-900 text-xs font-mono break-all">{scheme._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Schemes = ({ language = "en" }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load bookmarked schemes from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("bookmarkedSchemes");
    if (saved) {
      setBookmarkedSchemes(JSON.parse(saved));
    }
  }, []);

  // Save bookmarked schemes to localStorage
  const saveBookmarksToStorage = (bookmarks) => {
    localStorage.setItem("bookmarkedSchemes", JSON.stringify(bookmarks));
  };

  // Toggle bookmark for a scheme
  const toggleBookmark = (scheme) => {
    const isBookmarked = bookmarkedSchemes.some((b) => b._id === scheme._id);
    let updatedBookmarks;

    if (isBookmarked) {
      updatedBookmarks = bookmarkedSchemes.filter((b) => b._id !== scheme._id);
    } else {
      updatedBookmarks = [...bookmarkedSchemes, scheme];
    }

    setBookmarkedSchemes(updatedBookmarks);
    saveBookmarksToStorage(updatedBookmarks);
  };

  // Check if a scheme is bookmarked
  const isSchemeBookmarked = (schemeId) => {
    return bookmarkedSchemes.some((b) => b._id === schemeId);
  };

  // Fetch schemes from API
  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://yojana-finder-w8y9.onrender.com/api/scheme/agriculture"
      );
      const data = await response.json();

      if (data.schemes) {
        setSchemes(data.schemes);

        // Extract unique tags
        const tagsSet = new Set();
        data.schemes.forEach((scheme) => {
          if (scheme.tags && scheme.tags[language]) {
            scheme.tags[language].forEach((tag) => tagsSet.add(tag));
          }
        });
        setAllTags(Array.from(tagsSet).sort());
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter schemes based on search, level, and tag
  const filteredSchemes = schemes.filter((scheme) => {
    // Search filter
    const schemeName = scheme.scheme_name?.[language] || scheme.scheme_name?.en || "";
    const schemeDetails = scheme.details?.[language] || scheme.details?.en || "";
    const schemeBenefits = scheme.benefits?.[language] || scheme.benefits?.en || "";

    const matchesSearch =
      searchQuery === "" ||
      schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schemeDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schemeBenefits.toLowerCase().includes(searchQuery.toLowerCase());

    // Level filter
    const matchesLevel = selectedLevel === "all" || scheme.level === selectedLevel;

    // Tag filter
    const matchesTag =
      selectedTag === "all" ||
      (scheme.tags?.[language] && scheme.tags[language].includes(selectedTag));

    return matchesSearch && matchesLevel && matchesTag;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel, selectedTag]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchemes = filteredSchemes.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLevel("all");
    setSelectedTag("all");
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Get text based on language
  const getText = (key) => {
    const texts = {
      title: {
        en: "Agricultural Schemes",
        hi: "कृषि योजनाएं",
        ml: "കാർഷിക പദ്ധതികൾ",
      },
      subtitle: {
        en: "Find government schemes and benefits for farmers and agricultural activities",
        hi: "किसानों और कृषि गतिविधियों के लिए सरकारी योजनाएं और लाभ खोजें",
        ml: "കർഷകർക്കും കാർഷിക പ്രവർത്തനങ്ങൾക്കുമുള്ള സർക്കാർ പദ്ധതികളും ആനുകൂല്യങ്ങളും കണ്ടെത്തുക",
      },
      search: {
        en: "Search Schemes",
        hi: "योजनाएं खोजें",
        ml: "പദ്ധതികൾ തിരയുക",
      },
      searchPlaceholder: {
        en: "Search by scheme name, benefits, or keywords...",
        hi: "योजना के नाम, लाभ या कीवर्ड से खोजें...",
        ml: "പദ്ധതിയുടെ പേര്, ആനുകൂല്യങ്ങൾ അല്ലെങ്കിൽ കീവേഡുകൾ ഉപയോഗിച്ച് തിരയുക...",
      },
      level: {
        en: "Level",
        hi: "स्तर",
        ml: "നില",
      },
      tag: {
        en: "Tag",
        hi: "टैग",
        ml: "ടാഗ്",
      },
      clearFilters: {
        en: "Clear Filters",
        hi: "फ़िल्टर साफ़ करें",
        ml: "ഫിൽട്ടറുകൾ മായ്ക്കുക",
      },
      found: {
        en: "Found",
        hi: "मिला",
        ml: "കണ്ടെത്തി",
      },
      results: {
        en: "results",
        hi: "परिणाम",
        ml: "ഫലങ്ങൾ",
      },
      searching: {
        en: "Searching...",
        hi: "खोज रहे हैं...",
        ml: "തിരയുന്നു...",
      },
      loading: {
        en: "Loading Schemes...",
        hi: "योजनाएं लोड हो रही हैं...",
        ml: "പദ്ധതികൾ ലോഡ് ചെയ്യുന്നു...",
      },
      noSchemes: {
        en: "No schemes found",
        hi: "कोई योजना नहीं मिली",
        ml: "പദ്ധതികളൊന്നും കണ്ടെത്തിയില്ല",
      },
      noSchemesDesc: {
        en: "Adjust your filters or keywords to explore more opportunities.",
        hi: "अधिक अवसरों का पता लगाने के लिए अपने फ़िल्टर या कीवर्ड समायोजित करें।",
        ml: "കൂടുതൽ അവസരങ്ങൾ പര്യവേക്ഷണം ചെയ്യാൻ നിങ്ങളുടെ ഫിൽട്ടറുകളോ കീവേഡുകളോ ക്രമീകരിക്കുക.",
      },
      benefits: {
        en: "Benefits:",
        hi: "लाभ:",
        ml: "ആനുകൂല്യങ്ങൾ:",
      },
      viewDetails: {
        en: "View Details",
        hi: "विवरण देखें",
        ml: "വിശദാംശങ്ങൾ കാണുക",
      },
      all: {
        en: "All",
        hi: "सभी",
        ml: "എല്ലാം",
      },
      stateLevel: {
        en: "State Level",
        hi: "राज्य स्तर",
        ml: "സംസ്ഥാന തലം",
      },
      updated: {
        en: "Updated",
        hi: "अपडेट किया गया",
        ml: "അപ്ഡേറ്റ് ചെയ്തത്",
      },
      more: {
        en: "more",
        hi: "और",
        ml: "കൂടുതൽ",
      },
      back: {
        en: "Back",
        hi: "पीछे",
        ml: "പിന്നോട്ട്",
      },
      next: {
        en: "Next",
        hi: "आगे",
        ml: "അടുത്തത്",
      },
      showing: {
        en: "Showing",
        hi: "दिखा रहे हैं",
        ml: "കാണിക്കുന്നു",
      },
      of: {
        en: "of",
        hi: "में से",
        ml: "ൽ",
      },
    };

    return texts[key]?.[language] || texts[key]?.en || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getText("title")}</h1>
          <p className="text-gray-600">{getText("subtitle")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <Card className="p-6 mb-8 bg-white shadow-sm border border-gray-200">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Search Bar */}
            <div className="form-control">
              <label
                htmlFor="search"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {getText("search")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getText("searchPlaceholder")}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  className="px-6 py-2 btn-primary rounded-lg font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">search</span>
                  {getText("search")}
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Level Filter */}
              <div>
                <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2">
                  {getText("level")}
                </label>
                <select
                  id="level"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">{getText("all")}</option>
                  <option value="State">State</option>
                  <option value="Central">Central</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label htmlFor="tag" className="block text-sm font-semibold text-gray-700 mb-2">
                  {getText("tag")}
                </label>
                <select
                  id="tag"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">{getText("all")}</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                  {getText("clearFilters")}
                </button>
              </div>
            </div>
          </form>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading
              ? getText("searching")
              : `${getText("found")} ${filteredSchemes.length} ${getText("results")}`}
            {selectedLevel !== "all" && ` • ${selectedLevel}`}
            {selectedTag !== "all" && ` • ${selectedTag}`}
          </p>
          {!loading && filteredSchemes.length > 0 && (
            <p className="text-sm text-gray-500">
              {getText("showing")} {startIndex + 1}-{Math.min(endIndex, filteredSchemes.length)} {getText("of")} {filteredSchemes.length}
            </p>
          )}
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary"></div>
            <p className="text-gray-600 font-medium mt-4">{getText("loading")}</p>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{getText("noSchemes")}</h3>
            <p className="text-gray-600">{getText("noSchemesDesc")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedSchemes.map((scheme) => (
                <Card
                  key={scheme._id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {getText("stateLevel")}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getText("updated")} {formatDate(scheme.updatedAt)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3">
                        {scheme.scheme_name?.[language] || scheme.scheme_name?.en}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                      {scheme.details?.[language] || scheme.details?.en}
                    </p>

                    {/* Benefits */}
                    {scheme.benefits && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{getText("benefits")}</p>
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {renderField(scheme.benefits?.[language] || scheme.benefits?.en, { maxLen: 150 })}
                        </p>
                      </div>
                    )}

                    {/* Category Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {scheme.schemeCategory?.[language]?.slice(0, 2).map((cat, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {cat}
                        </span>
                      ))}
                      {scheme.schemeCategory?.[language]?.length > 2 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{scheme.schemeCategory[language].length - 2} {getText("more")}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {scheme.tags?.[language] && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {scheme.tags[language].slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">
                            {tag}
                          </span>
                        ))}
                        {scheme.tags[language].length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded border border-gray-200">
                            +{scheme.tags[language].length - 3} {getText("more")}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedScheme(scheme)}
                      className="w-full py-3 btn-primary rounded-lg font-semibold transition-colors"
                    >
                      {getText("viewDetails")}
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  {getText("back")}
                </button>

                {/* Current Page Indicator */}
                <div className="px-6 py-2 bg-primary text-white rounded-lg font-bold">
                  {currentPage}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {getText("next")}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          language={language}
          onClose={() => setSelectedScheme(null)}
          onToggleBookmark={toggleBookmark}
          isBookmarked={isSchemeBookmarked(selectedScheme._id)}
        />
      )}
    </div>
  );
};

export default Schemes;