// Helper to safely render field values (string, object, array)
const renderField = (field, opts = {}) => {
  if (typeof field === "string") {
    // Optionally trim for benefits if opts.maxLen
    if (opts.maxLen && field.length > opts.maxLen) {
      return field.substring(0, opts.maxLen) + "...";
    }
    return field;
  } else if (Array.isArray(field)) {
    // Render array as comma separated string
    return field.join(", ");
  } else if (typeof field === "object" && field !== null) {
    // Render object as key: value pairs, arrays as comma separated
    return Object.entries(field)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        } else if (typeof value === "object" && value !== null) {
          // Nested object, flatten one level
          return `${key}: { ${Object.entries(value)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(", ")} }`;
        } else {
          return `${key}: ${value}`;
        }
      })
      .join("; ");
  } else if (field !== undefined && field !== null) {
    // fallback for numbers etc.
    return String(field);
  }
  // If null/undefined
  return "";
};
import React, { useState, useEffect } from "react";
import { schemesService } from "../services/api";
import { Card } from "./ui/Card";
import { getMultilingualOptions } from "../utils/languageOptions";

const Schemes = ({ language = "en" }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedSector, setSelectedSector] = useState("agriculture");
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState([]);

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
    const isBookmarked = bookmarkedSchemes.some((b) => b.id === scheme.id);
    let updatedBookmarks;

    if (isBookmarked) {
      updatedBookmarks = bookmarkedSchemes.filter((b) => b.id !== scheme.id);
    } else {
      updatedBookmarks = [...bookmarkedSchemes, scheme];
    }

    setBookmarkedSchemes(updatedBookmarks);
    saveBookmarksToStorage(updatedBookmarks);
  };

  // Check if a scheme is bookmarked
  const isSchemeBookmarked = (schemeId) => {
    return bookmarkedSchemes.some((b) => b.id === schemeId);
  };

  // Get multilingual options based on current language
  const languageOptions = getMultilingualOptions(language);
  const stateOptions = languageOptions.states;
  const sectorOptions = languageOptions.sectors;

  const fetchSchemes = async (
    search = searchQuery,
    state = selectedState,
    sector = selectedSector
  ) => {
    setLoading(true);
    try {
      const response = await schemesService.getSchemes(search, state, sector);
      if (response.success) {
        setSchemes(response.schemes);
        setTotalSchemes(response.total);
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    fetchSchemes(searchQuery, state, selectedSector);
  };

  const handleSectorChange = (sector) => {
    setSelectedSector(sector);
    fetchSchemes(searchQuery, selectedState, sector);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedState("");
    setSelectedSector("agriculture");
    fetchSchemes("", "", "agriculture");
  };

  return (
    <div data-theme="lemonade" className="p-4 md:p-6 bg-base-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#064e3b] mb-2 flex items-center gap-3 tracking-tight uppercase">
            {language === "ml"
              ? "കാർഷിക പദ്ധതികൾ"
              : language === "hi"
                ? "कृषि योजनाएं"
                : "Agricultural Schemes"}
            <span className="material-symbols-outlined text-3xl">account_balance</span>
          </h1>
          <p className="text-base-content/60 font-medium">
            {language === "ml"
              ? "കർഷകർക്കും കാർഷിക പ്രവർത്തനങ്ങൾക്കുമുള്ള സർക്കാർ പദ്ധതികളും ആനുകൂല്യങ്ങളും കണ്ടെത്തുക"
              : language === "hi"
                ? "किसानों और कृषि गतिविधियों के लिए सरकारी योजनाएं और लाभ खोजें"
                : "Find government schemes and benefits for farmers and agricultural activities"}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6 bg-base-100 shadow-xl border border-base-300">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Bar */}
            <div className="form-control">
              <label
                htmlFor="search"
                className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-2"
              >
                Search Schemes
              </label>
              <div className="join w-full shadow-sm">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by scheme name, benefits, or keywords..."
                  className="input input-bordered join-item w-full focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                />
                <button
                  type="submit"
                  className="btn join-item bg-[#064e3b] hover:bg-[#053d2e] text-white border-none px-6"
                >
                  <span className="material-symbols-outlined text-sm mr-1">search</span>
                  Search
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* State Filter */}
              <div className="form-control">
                <label
                  htmlFor="state"
                  className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-2"
                >
                  State/UT
                </label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="select select-bordered w-full font-bold bg-base-200"
                >
                  {stateOptions.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector Filter */}
              <div className="form-control">
                <label
                  htmlFor="sector"
                  className="label-text font-black uppercase text-[10px] tracking-widest opacity-50 mb-2"
                >
                  Sector
                </label>
                <select
                  id="sector"
                  value={selectedSector}
                  onChange={(e) => handleSectorChange(e.target.value)}
                  className="select select-bordered w-full font-bold bg-base-200"
                >
                  {sectorOptions.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-ghost border-base-300 w-full font-bold text-[#064e3b] hover:bg-[#bef264]/10"
                >
                  <span className="material-symbols-outlined text-sm mr-1">filter_alt_off</span>
                  Clear Filters
                </button>
              </div>
            </div>
          </form>
        </Card>

        {/* Bookmarked Schemes Section */}
        {bookmarkedSchemes.length > 0 && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-[#bef264]/10 to-transparent border-l-4 border-l-[#bef264] shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-[#064e3b] flex items-center gap-2 uppercase tracking-tight">
                <span className="material-symbols-outlined text-[#064e3b]">bookmark_heart</span>
                {language === "ml"
                  ? "ബുക്ക്മാർക്ക് ചെയ്ത പദ്ധതികൾ"
                  : language === "hi"
                    ? "बुकमार्क की गई योजनाएं"
                    : "Your Bookmarked Schemes"}
              </h2>
              <span className="badge badge-primary font-black py-3 px-4 shadow-sm">
                {bookmarkedSchemes.length}{" "}
                {bookmarkedSchemes.length === 1 ? "scheme" : "schemes"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="card bg-base-100 border border-base-300 p-4 hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-black text-[#064e3b] text-sm leading-tight flex-1 line-clamp-2">
                      {scheme.scheme_name}
                    </h3>
                    <button
                      onClick={() => toggleBookmark(scheme)}
                      className="text-[#064e3b] hover:text-error transition-colors shrink-0"
                      title="Remove bookmark"
                    >
                      <span className="material-symbols-outlined font-fill text-xl">bookmark</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge badge-info badge-outline font-bold text-[9px] uppercase py-2">
                      {scheme.level || "Government"}
                    </span>
                    {scheme.category && (
                      <span className="badge badge-success badge-outline font-bold text-[9px] uppercase py-2">
                        {scheme.category}
                      </span>
                    )}
                  </div>

                  <p className="text-base-content/60 text-xs leading-relaxed line-clamp-2 mb-4 h-8">
                    {scheme.details
                      ? renderField(scheme.details, { maxLen: 120 })
                      : "No details available"}
                  </p>

                  <div className="mt-auto pt-3 border-t border-base-200">
                    <div className="flex justify-between items-center">
                      <button className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] hover:link flex items-center gap-1">
                        View Details <span className="material-symbols-outlined text-[12px]">arrow_forward_ios</span>
                      </button>
                      <span className="text-[9px] font-black uppercase opacity-40">
                        {language === "ml"
                          ? "സംരക്ഷിച്ചത്"
                          : language === "hi"
                            ? "सहेजा गया"
                            : "Saved"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                {language === "ml"
                  ? "ബുക്ക്മാർക്ക് നീക്കം ചെയ്യാൻ ബാഡ്ജിൽ ക്ലിക്ക് ചെയ്യുക"
                  : language === "hi"
                    ? "बुकमार्क हटाने के लिए बैज पर क्लिक करें"
                    : "Click bookmark icon to remove from saved list"}
              </p>
            </div>
          </Card>
        )}

        {/* Results Summary */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-2">
          <div>
            <h2 className="text-xl font-black text-[#064e3b] uppercase tracking-tight">
              {language === "ml"
                ? "എല്ലാ പദ്ധതികളും"
                : language === "hi"
                  ? "सभी योजनाएं"
                  : "Available Schemes"}
            </h2>
            <p className="text-base-content/50 font-bold text-xs uppercase tracking-wider">
              {loading
                ? "Searching..."
                : `Found ${totalSchemes} results`}
              {selectedState && ` • ${selectedState}`}
            </p>
          </div>

          {bookmarkedSchemes.length > 0 && (
            <div className="badge badge-outline border-base-300 opacity-50 text-[10px] font-bold uppercase py-3">
              {language === "ml"
                ? "മുകളിൽ സേവ് ചെയ്തവ കാണുക"
                : language === "hi"
                  ? "ऊपर सहेजी गई योजनाएं देखें"
                  : "Review saved items at the top"}
            </div>
          )}
        </div>

        {/* Schemes List */}
        <div className="space-y-6 mb-20">
          {loading ? (
            <Card className="p-20 text-center bg-base-100 shadow-xl">
              <span className="loading loading-infinity loading-lg text-[#064e3b]"></span>
              <p className="text-[#064e3b] font-black uppercase tracking-widest mt-4">Syncing with Central Database...</p>
            </Card>
          ) : schemes.length === 0 ? (
            <Card className="p-20 text-center bg-base-100 shadow-xl opacity-60">
              <span className="material-symbols-outlined text-7xl text-base-content/20 mb-4">search_off</span>
              <h3 className="text-xl font-black text-[#064e3b] uppercase">
                No schemes found
              </h3>
              <p className="text-sm font-bold text-base-content/50 mt-2">
                Adjust your filters or keywords to explore more opportunities.
              </p>
            </Card>
          ) : (
            schemes.map((scheme) => (
              <Card
                key={scheme.id}
                className="hover:shadow-2xl transition-all bg-base-100 border border-base-300 group overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Status Sidebar on Card */}
                  <div className="bg-base-200 md:w-48 p-6 flex flex-col gap-3 border-b md:border-b-0 md:border-r border-base-300 group-hover:bg-[#bef264]/10 transition-colors items-center justify-center text-center">
                    <div className="badge bg-[#064e3b] text-white border-none font-bold py-4 w-full uppercase text-[10px]">
                      {scheme.level || "Government"}
                    </div>
                    <div className="badge badge-outline border-[#064e3b]/30 text-[#064e3b] font-black py-4 w-full text-[10px] uppercase bg-base-100">
                      {scheme.category || "General"}
                    </div>
                    <button
                      onClick={() => toggleBookmark(scheme)}
                      className={`btn btn-sm btn-block mt-auto gap-2 border-none font-black text-[10px] uppercase ${
                        isSchemeBookmarked(scheme.id)
                          ? "bg-error text-white hover:bg-red-700"
                          : "bg-base-300 text-base-content hover:bg-[#064e3b] hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isSchemeBookmarked(scheme.id) ? "bookmark_remove" : "bookmark_add"}
                      </span>
                      {isSchemeBookmarked(scheme.id) ? "Saved" : "Save"}
                    </button>
                  </div>

                  {/* Scheme Details Content */}
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-black text-[#064e3b] leading-tight flex-1">
                        {scheme.scheme_name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <h4 className="label-text font-black uppercase text-[11px] tracking-[0.2em] text-[#064e3b]/40 mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">description</span>
                          Description
                        </h4>
                        <p className="text-base-content/80 text-sm leading-relaxed">
                          {renderField(scheme.details)}
                        </p>
                      </div>

                      {scheme.benefits && (
                        <div className="bg-[#bef264]/10 p-5 rounded-2xl border border-[#bef264]/30">
                          <h4 className="label-text font-black uppercase text-[11px] tracking-[0.2em] text-[#064e3b] mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Benefits
                          </h4>
                          <p className="text-[#064e3b] text-sm font-bold leading-relaxed">
                            {renderField(scheme.benefits, { maxLen: 200 })}
                          </p>
                        </div>
                      )}

                      {scheme.eligibility && (
                        <div>
                          <h4 className="label-text font-black uppercase text-[11px] tracking-[0.2em] text-[#064e3b]/40 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Eligibility
                          </h4>
                          <p className="text-base-content/70 text-sm font-medium italic">
                            {renderField(scheme.eligibility)}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      {scheme.tags && scheme.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {scheme.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="badge badge-ghost text-base-content/50 border-none font-bold text-[9px] uppercase py-3"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 pt-6 border-t border-base-200 flex justify-between items-center">
                      <button className="btn bg-[#064e3b] hover:bg-[#053d2e] text-white border-none px-10 shadow-lg font-black uppercase tracking-widest text-xs">
                        Apply Now
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                      <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-widest">
                        {isSchemeBookmarked(scheme.id)
                          ? "Secured in Bookmarks"
                          : "Quick access available via Save"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Schemes;
