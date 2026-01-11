import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Navbar } from "../components/navbar.components.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const apiBase = import.meta.env.VITE_BASE_URL || "http://localhost:2804/api/v1";

const isResumeAllowed = (file) => {
  if (!file) return false;
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return allowed.includes(file.type);
};

const JobsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const role = user?.role;
  const isAlumni = role === "alumni";
  const isStudent = role === "student";
  const showJobForm = isAuthenticated && isAlumni;

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobError, setJobError] = useState("");
  const [applyError, setApplyError] = useState("");

  const [jobForm, setJobForm] = useState({
    title: "",
    openings: "",
    skills: "",
    package: "",
    details: "",
  });

  const [applyForm, setApplyForm] = useState({ resume: null });

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }, [jobs]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${apiBase}/jobs`, { withCredentials: true });
        const list = res?.data?.data || [];
        setJobs(list);
      } catch (err) {
        console.error("Could not load jobs", err);
      }
    };

    fetchJobs();
  }, []);

  const resetJobForm = () => {
    setJobForm({ title: "", openings: "", skills: "", package: "", details: "" });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setJobError("");
    if (role !== "alumni") {
      setJobError("Only alumni can post jobs");
      return;
    }
    const { title, openings, skills, package: pkg, details } = jobForm;
    if (!title.trim() || !details.trim() || !pkg.trim()) {
      setJobError("Title, package, and details are required");
      return;
    }
    const openNum = Number(openings);
    if (!openings || Number.isNaN(openNum) || openNum <= 0) {
      setJobError("Openings must be a positive number");
      return;
    }

    const skillsArr = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await axios.post(
        `${apiBase}/jobs`,
        {
          title: title.trim(),
          openings: openNum,
          skills: skillsArr,
          package: pkg.trim(),
          details: details.trim(),
        },
        { withCredentials: true }
      );

      const created = res?.data?.data;
      if (created) {
        setJobs((prev) => [created, ...prev]);
        resetJobForm();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not post job";
      setJobError(msg);
    }
  };

  const handleApply = async (jobId) => {
    setApplyError("");
    if (!isStudent) {
      setApplyError("Only students can apply");
      return;
    }
    if (!applyForm.resume) {
      setApplyError("Upload your resume (PDF/DOC)");
      return;
    }
    if (!isResumeAllowed(applyForm.resume)) {
      setApplyError("Resume must be PDF or DOC/DOCX");
      return;
    }

    try {
      const res = await axios.post(
        `${apiBase}/jobs/${jobId}/apply`,
        {
          fileName: applyForm.resume.name,
        },
        { withCredentials: true }
      );

      const updated = res?.data?.data;
      if (updated) {
        setJobs((prev) => prev.map((job) => (job._id === updated._id ? updated : job)));
        setSelectedJob((prev) => (prev && prev._id === updated._id ? updated : prev));
      }
      setApplyForm({ resume: null });
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not apply";
      setApplyError(msg);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!jobId) return;
    try {
      await axios.delete(`${apiBase}/jobs/${jobId}`, { withCredentials: true });
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      if (selectedJob && selectedJob._id === jobId) {
        setSelectedJob(null);
      }
    } catch (err) {
      setJobError(err?.response?.data?.message || "Could not delete job");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#eef2f9] to-[#dfe7fb] text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pb-20 pt-24 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Jobs</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Post roles & apply</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-2">
              Alumni can publish openings; students can apply with a resume. Track applicants in one place.
            </p>
          </div>
          {!isAuthenticated && (
            <div className="text-xs px-4 py-2 rounded-full bg-slate-900 text-white shadow dark:bg-blue-600">Login required</div>
          )}
        </div>

        <div className={`grid grid-cols-1 ${showJobForm ? "lg:grid-cols-[1.6fr_1.1fr]" : ""} gap-8 items-start`}>
          <div className="space-y-4">
            {sortedJobs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/15 bg-white/85 dark:bg-white/5 p-12 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800 dark:text-white">No jobs yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-300 mt-2">Alumni can post an opening from the panel.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedJobs.map((job) => (
                  <article
                    key={job._id}
                    className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.05] p-5 shadow-lg hover:shadow-2xl transition cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">{job.package}</p>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{job.details.slice(0, 110)}{job.details.length > 110 ? "…" : ""}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-900 text-white dark:bg-blue-600">{job.openings} openings</span>
                          {job.skills.map((s, idx) => (
                            <span key={s + idx} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-500 dark:text-slate-300">
                        <p>Applicants</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{job.applicants.length}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </div>

        {showJobForm && (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.05] p-6 shadow-lg space-y-4">
            <div className="flex items-start justify-between">
            <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                Post a job
                </p>
                <h2 className="text-xl font-bold">Alumni dashboard</h2>
            </div>
            {!isAlumni && (
                <span className="text-xs text-slate-500">Alumni only</span>
            )}
            </div>

            {jobError && (
            <p className="text-sm text-red-600">{jobError}</p>
            )}

            <form className="space-y-3" onSubmit={handleCreateJob}>
            <div>
                <label className="text-xs text-slate-500 dark:text-slate-300">
                Job title
                </label>
                <input
                type="text"
                value={jobForm.title}
                onChange={(e) =>
                    setJobForm((p) => ({ ...p, title: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g. Backend Engineer"
                disabled={!showJobForm}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                <label className="text-xs text-slate-500 dark:text-slate-300">
                    Openings
                </label>
                <input
                    type="number"
                    min="1"
                    value={jobForm.openings}
                    onChange={(e) =>
                    setJobForm((p) => ({ ...p, openings: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g. 3"
                    disabled={!showJobForm}
                />
                </div>

                <div>
                <label className="text-xs text-slate-500 dark:text-slate-300">
                    Package
                </label>
                <input
                    type="text"
                    value={jobForm.package}
                    onChange={(e) =>
                    setJobForm((p) => ({ ...p, package: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g. ₹8-12 LPA"
                    disabled={!showJobForm}
                />
                </div>
            </div>

            <div>
                <label className="text-xs text-slate-500 dark:text-slate-300">
                Skills (comma separated)
                </label>
                <input
                type="text"
                value={jobForm.skills}
                onChange={(e) =>
                    setJobForm((p) => ({ ...p, skills: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="React, Node, SQL"
                disabled={!showJobForm}
                />
            </div>

            <div>
                <label className="text-xs text-slate-500 dark:text-slate-300">
                Details
                </label>
                <textarea
                value={jobForm.details}
                onChange={(e) =>
                    setJobForm((p) => ({ ...p, details: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[120px]"
                placeholder="Describe the role, location, and process."
                disabled={!showJobForm}
                />
            </div>

            <button
                type="submit"
                disabled={!showJobForm}
                className="w-full px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
                Post job
            </button>
            </form>
        </div>
        )}

        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedJob(null)} />
            <div className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200 dark:border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">{selectedJob.package}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedJob.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{selectedJob.openings} openings • {selectedJob.skills.join(", ")}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Posted by {selectedJob.postedByName}</p>
                </div>
                <div className="flex gap-2">
                  {isAlumni && user?._id === selectedJob.postedBy && (
                    <button
                      onClick={() => handleDeleteJob(selectedJob._id)}
                      className="px-3 py-1.5 rounded-full text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-3 py-1.5 rounded-full text-sm font-semibold border border-slate-300 text-slate-900 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{selectedJob.details}</p>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Apply to this job</p>
                    <span className="text-xs text-slate-500">PDF/DOC only</span>
                  </div>

                  {applyError && <p className="text-sm text-red-600">{applyError}</p>}

                  {isStudent ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="file"
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx,.pdf"
                        onChange={(e) => setApplyForm({ resume: e.target.files?.[0] || null })}
                        className="flex-1 text-sm text-slate-600 dark:text-slate-200 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-200 file:bg-white file:text-slate-800 dark:file:bg-slate-800 dark:file:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleApply(selectedJob._id)}
                        className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:shadow-lg"
                      >
                        Submit resume
                      </button>
                    </div>
                  ) : !isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => (window.location.href = "/auth")}
                      className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:shadow-lg"
                    >
                      Login to apply
                    </button>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Only students can apply to jobs.
                    </p>
                  )}
                </div>

                {role === "alumni" && user?._id === selectedJob.postedBy && (
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Applications ({selectedJob.applicants.length})</p>
                      <span className="text-xs text-slate-500">Names, avatars, resumes</span>
                    </div>
                    {selectedJob.applicants.length === 0 ? (
                      <p className="text-sm text-slate-500">No applicants yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedJob.applicants.map((app) => (
                          <div key={app.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2">
                            <div className="flex items-center gap-3">
                              {app.avatar ? (
                                <img src={app.avatar} alt={app.name} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                                  {(app.name || "?").slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{app.name}</p>
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {app.fileName || "Resume"}
                                </a>
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">Applied just now</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default JobsPage;
