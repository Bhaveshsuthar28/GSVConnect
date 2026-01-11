import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Navbar } from "../components/navbar.components.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const branches = [
  { value: "AIDS", label: "AIDS - Artificial Intelligence and Data Science" },
  { value: "ECE", label: "ECE - Electronics and Communication Engineering" },
  { value: "EE", label: "EE - Electrical Engineering" },
  { value: "ME", label: "ME - Mechanical Engineering" },
  { value: "AE", label: "AE - Aerospace Engineering" },
];

const apiBase = import.meta.env.VITE_BASE_URL || "http://localhost:2804/api/v1";

const StoriesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isAlumni = user?.role === "alumni";
  const canPostStory = isAuthenticated && isAlumni;
  const [filters, setFilters] = useState({ search: "", branch: "" });
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState({ title: "", branch: "", body: "" });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const name = story.authorName || story.author || "";
      const matchesName = filters.search ? name.toLowerCase().includes(filters.search.toLowerCase()) : true;
      const matchesBranch = filters.branch ? story.branch === filters.branch : true;
      return matchesName && matchesBranch;
    });
  }, [filters, stories]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const res = await axios.get(`${apiBase}/alumni/stories`, { withCredentials: true });
        setStories(res?.data?.data || []);
      } catch (err) {
        const msg = err?.response?.data?.message || "Could not load stories";
        setLoadError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [images]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const combined = [...images, ...files].slice(0, 3);
    setImages(combined);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDeleteStory = async (id) => {
    try {
      await axios.delete(`${apiBase}/alumni/stories/${id}`, { withCredentials: true });
      setStories((prev) => prev.filter((story) => (story._id || story.id) !== id));
      toast.success("Story deleted");
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not delete story";
      toast.error(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and story are required.");
      return;
    }
    if (!form.branch) {
      setError("Select a branch.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("branch", form.branch);
      formData.append("body", form.body.trim());
      images.slice(0, 3).forEach((file) => formData.append("images", file));

      const res = await axios.post(`${apiBase}/alumni/stories`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const payload = res?.data?.data || res?.data || {};
      const saved = {
        ...payload,
        title: payload.title || form.title.trim(),
        branch: payload.branch || form.branch,
        body: payload.body || form.body.trim(),
        images: payload.images || [],
        author: payload.author || user?._id,
        authorName: payload.authorName || user?.name || "You",
      };

      setStories((prev) => [saved, ...prev]);
      setForm({ title: "", branch: "", body: "" });
      setImages([]);
      setShowForm(false);
      toast.success("Story posted");
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not post story";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-black text-slate-900 dark:text-white">
      <Navbar />
    <div className="pt-24">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-600 dark:text-blue-300">Stories</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Shared journeys</h1>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-2">Read experiences from alumni and peers.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/20 text-sm text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Back
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.05] p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search by author"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <select
                value={filters.branch}
                onChange={(e) => setFilters((prev) => ({ ...prev, branch: e.target.value }))}
                className="w-full sm:w-48 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading && <p className="text-sm text-slate-500">Loading stories...</p>}
            {loadError && !isLoading ? <p className="text-sm text-red-600">{loadError}</p> : null}

            {!isLoading && !loadError && filteredStories.length === 0 ? (
              <p className="text-sm text-slate-500">No stories yet. Be the first to share.</p>
            ) : null}

            {!isLoading && !loadError && filteredStories.length > 0 ? (
              <div className="grid gap-4">
                {filteredStories.map((story) => (
                  <article
                    key={story._id || story.id}
                    onClick={() => setSelectedStory(story)}
                    className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-white/10 
                              bg-white/90 dark:bg-white/[0.04] 
                              p-4 sm:p-5 
                              hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex gap-4 items-start">
                      
                      {/* TEXT */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-300 font-semibold">
                          {story.branch}
                        </p>

                        <h3 className="mt-1 text-base font-semibold line-clamp-1">
                          {story.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {story.body}
                        </p>

                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {story.authorName || "Unknown"}
                        </p>
                      </div>

                      {/* IMAGE (ONLY ONE) */}
                      {story.images?.[0] && (
                        <div className="hidden sm:block w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                          <img
                            src={story.images[0]}
                            alt="story"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {canPostStory && (
          <div className="mt-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.05] p-6 shadow-lg space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Share story</p>
                <h2 className="text-xl font-bold">Add your experience</h2>
              </div>
                <button
                  onClick={() => setShowForm((v) => !v)}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold border border-slate-300 text-slate-800 hover:bg-slate-200 transition dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  {showForm ? "Close" : "Share"}
                </button>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            {canPostStory && showForm && (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="E.g. My first internship"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-300">Branch</label>
                  <select
                    value={form.branch}
                    onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="" disabled>
                      Select branch
                    </option>
                    {branches.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-300">Story</label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[140px]"
                    placeholder="Share your journey..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-500 dark:text-slate-300">Images (up to 3)</label>
                    <span className="text-xs text-slate-500 dark:text-slate-300">{images.length}/3</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-600 dark:text-slate-200 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-200 file:bg-white file:text-slate-800 dark:file:bg-slate-800 dark:file:text-white file:text-sm"
                  />
                  {images.length ? (
                    <div className="flex flex-wrap gap-3">
                      {images.map((file, idx) => {
                        const url = imagePreviews[idx];
                        return (
                          <div key={idx} className="relative">
                            <div className="h-20 w-20 rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-slate-800">
                              {url ? (
                                <img src={url} alt={file.name} className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shadow"
                              aria-label="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Posting..." : "Post story"}
                </button>
              </form>
            )}
            {!canPostStory && (
              <p className="text-xs text-slate-500 dark:text-slate-300">Only alumni can post stories. Login to continue.</p>
            )}
          </div>
        )}

        {selectedStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedStory(null)} />
            <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200 dark:border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Story detail</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStory.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    {selectedStory.authorName || selectedStory.author} - {selectedStory.branch}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedStory.author && (
                    <button
                      onClick={() => {
                        navigate("/directory", { state: { profileId: selectedStory.author } });
                        setSelectedStory(null);
                      }}
                      className="px-3 py-1.5 rounded-full text-sm font-semibold border border-slate-300 text-slate-900 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                    >
                      View profile
                    </button>
                  )}
                  {isAuthenticated && user?._id && selectedStory.author === user._id && (
                    <button
                      onClick={() => handleDeleteStory(selectedStory._id || selectedStory.id)}
                      className="px-3 py-1.5 rounded-full text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="px-3 py-1.5 rounded-full text-sm font-semibold border border-slate-300 text-slate-900 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{selectedStory.body}</p>

                {selectedStory.images?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedStory.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <img src={img} alt="story media" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setSelectedImage(null)}>
            <div className="max-w-5xl w-full max-h-[85vh] overflow-hidden rounded-3xl bg-black/20 border border-white/10 p-3">
              <img src={selectedImage} alt="story" className="max-h-[80vh] max-w-full object-contain mx-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default StoriesPage;
