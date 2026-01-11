import Job from "./jobs.model.js";

export const listJobs = async (_req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ data: jobs });
  } catch (err) {
    return res.status(500).json({ message: "Could not load jobs" });
  }
};

export const createJob = async (req, res) => {
  try {
    if (req.user?.role !== "alumni") {
      return res.status(403).json({ message: "Only alumni can post jobs" });
    }

    const { title, openings, skills = [], package: pkg, details } = req.body || {};
    if (!title || !pkg || !details || !openings) {
      return res.status(400).json({ message: "Title, package, details, and openings are required" });
    }

    const openingsNum = Number(openings);
    if (!Number.isFinite(openingsNum) || openingsNum < 1) {
      return res.status(400).json({ message: "openings must be a number >= 1" });
    }

    const job = await Job.create({
      title: title.trim(),
      openings: openingsNum,
      skills: Array.isArray(skills) ? skills : [],
      package: pkg.trim(),
      details: details.trim(),
      postedBy: req.user._id,
      postedByName: req.user.name || "Alumni",
      postedByAvatar: req.user.profileImage || "",
      applicants: [],
    });

    return res.status(201).json({ data: job });
  } catch (err) {
    return res.status(500).json({ message: "Could not post job" });
  }
};

export const applyJob = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Only students can apply" });
    }

    const jobId = req.params.id;
    if (!jobId) return res.status(400).json({ message: "Job id required" });

    const fileName = String(req.body?.fileName || "Resume").slice(0, 120);
    const resumeUrl = String(req.body?.resumeUrl || "").trim();
    if (!resumeUrl) return res.status(400).json({ message: "resumeUrl is required" });

    try {
      const u = new URL(resumeUrl);
      if (u.protocol !== "https:" && u.protocol !== "http:") {
        return res.status(400).json({ message: "resumeUrl must be http(s)" });
      }
    } catch {
      return res.status(400).json({ message: "resumeUrl must be a valid URL" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const alreadyApplied = job.applicants?.some((a) => String(a.student) === String(req.user._id));
    if (alreadyApplied) {
      return res.status(409).json({ message: "You have already applied to this job" });
    }

    const applicant = {
      student: req.user._id,
      name: req.user.name || "Student",
      fileName,
      resumeUrl,
    };

    job.applicants.unshift(applicant);
    await job.save();

    return res.json({ data: job });
  } catch (err) {
    return res.status(500).json({ message: "Could not apply" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    if (req.user?.role !== "alumni") {
      return res.status(403).json({ message: "Only alumni can delete jobs" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await job.deleteOne();
    return res.json({ message: "Job deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Could not delete job" });
  }
};
