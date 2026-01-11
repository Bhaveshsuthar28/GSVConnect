import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/navbar.components.jsx";

const apiBase = import.meta.env.VITE_BASE_URL || "http://localhost:2804/api/v1";

const branches = [
  { value: "AIDS", label: "AIDS — Artificial Intelligence and Data Science" },
  { value: "ECE", label: "ECE — Electronics and Communication Engineering" },
  { value: "EE", label: "EE — Electrical Engineering" },
  { value: "ME", label: "ME — Mechanical Engineering" },
  { value: "AE", label: "AE — Aerospace Engineering" },
];

const chipColors = [
  "bg-blue-600 text-white",
  "bg-slate-900 text-white",
  "bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white",
];

const DirectoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState({ search: "", branch: "", year: "" });
  const [appliedFilters, setAppliedFilters] = useState({ search: "", branch: "", year: "" });
  const [alumni, setAlumni] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const start = 2020;
    const count = Math.max(0, current - start + 1);
    return Array.from({ length: count }, (_, idx) => current - idx);
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (appliedFilters.search.trim()) params.search = appliedFilters.search.trim();
      if (appliedFilters.branch) params.branch = appliedFilters.branch;
      if (appliedFilters.year) params.graduationYear = appliedFilters.year;

      const res = await axios.get(`${apiBase}/alumni/directory`, {
        params,
        withCredentials: true,
      });

      setAlumni(res.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        page: res.data?.pagination?.page || prev.page,
        pages: res.data?.pagination?.pages || 1,
        total: res.data?.pagination?.total || 0,
        limit: res.data?.pagination?.limit || prev.limit,
      }));
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load directory";
      setError(message);
      if (err?.response?.status === 401) {
        navigate("/auth");
      }
    } finally {
      setLoading(false);
    }
  }, [appliedFilters.branch, appliedFilters.search, appliedFilters.year, navigate, pagination.limit, pagination.page]);

  const fetchProfile = useCallback(async (id) => {
    setSelectedId(id);
    setProfileLoading(true);
    setSelectedProfile(null);
    setError("");
    try {
      const res = await axios.get(`${apiBase}/alumni/${id}`, { withCredentials: true });
      setSelectedProfile(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  useEffect(() => {
    const profileId = location.state?.profileId;
    if (profileId) {
      fetchProfile(profileId);
    }
  }, [fetchProfile, location.state?.profileId]);

  const goPage = (nextPage) => {
    setPagination((prev) => ({ ...prev, page: Math.min(Math.max(1, nextPage), prev.pages || 1) }));
  };

  const clearFilters = () => {
    const reset = { search: "", branch: "", year: "" };
    setFilters(reset);
    setAppliedFilters(reset);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const renderSkills = (skills = []) => {
    if (!skills.length) return <span className="text-xs text-slate-500 dark:text-slate-300">No skills listed</span>;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {skills.slice(0, 6).map((skill, idx) => (
          <span
            key={skill + idx}
            className={`text-xs px-2 py-1 rounded-full ${chipColors[idx % chipColors.length]}`}
          >
            {skill}
          </span>
        ))}
        {skills.length > 6 ? (
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80">
            +{skills.length - 6}
          </span>
        ) : null}
      </div>
    );
  };

  const renderCards = () => {
    if (loading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-40 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (!alumni.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/20 bg-white/70 dark:bg-white/5 p-8 text-center">
          <p className="text-lg font-semibold text-slate-700 dark:text-white">No alumni match these filters yet.</p>
          <p className="text-sm text-slate-500 mt-2">Try broadening your search or clearing filters.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {alumni.map((person) => (
          <button
            key={person._id}
            onClick={() => fetchProfile(person._id)}
            className="group text-left w-full h-full rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.05] shadow-lg hover:shadow-2xl transition-all duration-200 p-6 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <div className="flex items-center gap-4">
              {person.profileImage ? (
                <img
                  src={person.profileImage}
                  alt={person.name}
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-white/20 shadow-sm"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 text-white flex items-center justify-center font-semibold uppercase shadow-sm">
                  {(person.name || "?").slice(0, 2)}
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">{person.name}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{person.companyName || "Independent"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{person.verification?.degree || "Branch not set"}</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600 dark:text-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span>{person.verification?.graduationYear || "Year"}</span>
                <span className="text-slate-500 dark:text-slate-300">{person.address || "Location N/A"}</span>
              </div>
              {renderSkills(person.skills)}
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderProfile = () => {
    if (!selectedId) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 px-4 py-8" onClick={() => setSelectedId(null)}>
        <div
          className="w-full max-w-xl rounded-2xl bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-white/10">
            <div>
              <p className="text-lg font-bold">Alumni Profile</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">Tap outside to close</p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {profileLoading ? (
            <div className="p-6 animate-pulse space-y-3">
              <div className="h-6 bg-slate-200 dark:bg-white/10 rounded" />
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
              <div className="h-24 bg-slate-200 dark:bg-white/10 rounded" />
            </div>
          ) : selectedProfile ? (
            <div className="p-6 space-y-5">
              <div className="flex gap-4 items-center">
                {selectedProfile.profileImage ? (
                  <img
                    src={selectedProfile.profileImage}
                    alt={selectedProfile.name}
                    className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-white/20 shadow-sm"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 text-white flex items-center justify-center font-semibold uppercase shadow-sm">
                    {(selectedProfile.name || "?").slice(0, 2)}
                  </div>
                )}
                <div>
                  <p className="text-xl font-semibold">{selectedProfile.name}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{selectedProfile.companyName || "Independent"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">{selectedProfile.verification?.degree || "Branch not set"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                  <p className="text-slate-500 dark:text-slate-300">Graduation Year</p>
                  <p className="font-semibold">{selectedProfile.verification?.graduationYear || "Not provided"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                  <p className="text-slate-500 dark:text-slate-300">Location</p>
                  <p className="font-semibold">{selectedProfile.address || "Not provided"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                  <p className="text-slate-500 dark:text-slate-300">Email</p>
                  <p className="font-semibold break-all">{selectedProfile.email || "Hidden"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                  <p className="text-slate-500 dark:text-slate-300">Portfolio / Website</p>
                  <p className="font-semibold break-all">{selectedProfile.portfolioUrl || selectedProfile.website || "Not provided"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Skills</p>
                {renderSkills(selectedProfile.skills)}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-red-600">{error || "Profile unavailable"}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#eef2f9] to-[#dfe7fb] text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pb-20 pt-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Alumni Directory</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-blue-600">Find and connect</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-2">
              Search verified alumni by name, branch, or graduation year. Tap a card to preview their profile.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] p-6 shadow-md">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500 dark:text-slate-300">Search by name</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-300">Branch</label>
            <select
              value={filters.branch}
              onChange={(e) => updateFilter("branch", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-300">Graduation year</label>
            <select
              value={filters.year}
              onChange={(e) => updateFilter("year", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Any year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:shadow-lg"
            >
              Apply filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 dark:text-white dark:border-white/20"
            >
              Clear
            </button>
            {error ? <span className="text-sm text-red-600">{error}</span> : null}
            <span className="text-sm text-slate-500 ml-auto">{pagination.total} profiles</span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {renderCards()}

          <div className="flex items-center justify-center gap-3 text-sm text-slate-700 dark:text-white/80">
            <button
              onClick={() => goPage(pagination.page - 1)}
              className="px-3 py-2 rounded-full border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40"
              disabled={pagination.page <= 1}
            >
              Prev
            </button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <button
              onClick={() => goPage(pagination.page + 1)}
              className="px-3 py-2 rounded-full border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40"
              disabled={pagination.page >= pagination.pages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {renderProfile()}
    </div>
  );
};

export default DirectoryPage;
