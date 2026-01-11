import bcrypt from "bcryptjs";
import Alumni from "./alumini.models.js";
import { sendOtp, verifyOtp } from "../../shared/Otp/otp.service.js";
import { imageKit } from "../../config/image.config.js";
import { generateTokens } from "../../shared/auth/token.js";
import Story from "./story.model.js";
import { getAuthCookieOptions } from "../../shared/auth/cookies.js";

const MAX_BASE64_BYTES = 5 * 1024 * 1024;

const decodeBase64File = (value) => {
    if (typeof value !== "string" || !value) return null;
    const trimmed = value.trim();
    const match = trimmed.match(/^data:([\w/+.-]+);base64,(.+)$/);
    const base64 = match ? match[2] : trimmed;

    // Rough size check: base64 is ~4/3 of bytes.
    const approxBytes = Math.floor((base64.length * 3) / 4);
    if (approxBytes > MAX_BASE64_BYTES) {
        const err = new Error("Proof file is too large.");
        err.status = 413;
        throw err;
    }

    return Buffer.from(base64, "base64");
};

const normalizeValue = (value) => {
    if (value === undefined) return undefined;
    if (value === "") return null;
    return value;
};

const normalizeNumber = (value) => {
    if (value === undefined) return undefined;
    if (value === "") return null;
    const num = Number(value);
    if (Number.isNaN(num)) return { error: "graduationYear must be a number" };
    return num;
};

export const registerAlumni = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAlumni = await Alumni.findOne({ email });
        
        if (existingAlumni) {
            if (existingAlumni.isEmailVerified) {
                return res.status(409).json({ message: "Alumni with this email already exists." });
            } else {
                 const hashed = await bcrypt.hash(password, 12);
                 existingAlumni.name = name;
                 existingAlumni.password = hashed;
                 await existingAlumni.save();
                 
                 await sendOtp(email);
                 return res.status(200).json({ message: "Resent OTP for email verification." });
            }
        }

        const hashed = await bcrypt.hash(password, 12);
        await Alumni.create({
            name,
            email,
            password: hashed,
            isEmailVerified: false,
        });

        await sendOtp(email);
        res.status(201).json({ message: "OTP sent for email verification." });
    } catch (error) {
        console.error("Alumni Register Error:", error);
        const status = error?.status || 500;
        res.status(status).json({ message: status === 500 ? "Registration failed." : error.message });
    }
};

export const verifyAlumniOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const valid = await verifyOtp(email, otp);
        if (!valid) return res.status(400).json({ message: "Invalid or expired OTP" });

        const alumni = await Alumni.findOneAndUpdate({ email }, { isEmailVerified: true }, { new: true });
        if (!alumni) return res.status(404).json({ message: "Alumni not found." });

        const payload = { id: alumni._id, email: alumni.email, role: 'alumni' };
        const tokens = generateTokens(payload);

        const cookieOptions = getAuthCookieOptions();

        res.cookie("accessToken", tokens.accessToken, {
            ...cookieOptions,
            maxAge: 40 * 60 * 1000, 
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            ...cookieOptions,
            maxAge: 15 * 24 * 60 * 60 * 1000, 
        });

        res.json({ message: "Email verified successfully.", role: "alumni" });
    } catch (error) {
        console.error("Alumni Verify Error:", error);
        res.status(500).json({ message: "Verification failed." });
    }
};

export const loginAlumni = async (req, res) => {
    try {
        const { email, password } = req.body;
        const alumni = await Alumni.findOne({ email }).select("+password");

        if (!alumni || !(await bcrypt.compare(password, alumni.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!alumni.isEmailVerified) {
            return res.status(403).json({ message: "Please verify your email first." });
        }

        const payload = { id: alumni._id, email: alumni.email, role: 'alumni' };
        const tokens = generateTokens(payload);

        const cookieOptions = getAuthCookieOptions();

        res.cookie("accessToken", tokens.accessToken, {
            ...cookieOptions,
            maxAge: 40 * 60 * 1000, // 40 minutes calls
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            ...cookieOptions,
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        });

        res.json({ message: "Login successful", role: "alumni" });
    } catch (error) {
        console.error("Alumni Login Error:", error);
        res.status(500).json({ message: "Login failed." });
    }
};

export const uploadProof = async (req, res) => {
    try {
        const proofFile = req.file;
        const base64 = req.body?.file;

        if (!proofFile && !base64) {
            return res.status(400).json({ message: "No proof file provided." });
        }

        const fileBuffer = proofFile?.buffer || decodeBase64File(base64);

        const upload = await imageKit.upload({
            file: fileBuffer,
            fileName: `proof_${req.user._id}_${Date.now()}`,
            folder: "alumni_proofs",
            useUniqueFileName: true,
        });

        await Alumni.updateOne(
            { email: req.user.email },
            {
                verification: {
                    ...req.body,
                    proofUrl: upload.url,
                },
            }
        );

        res.json({ message: "Verification details submitted successfully." });
    } catch (error) {
        console.error("Upload proof error:", error);
        const status = error?.status || 500;
        res.status(status).json({ message: status === 500 ? "Failed to upload proof" : error.message });
    }
};


export const googleLogin = async (profile) => {
    let alumni = await Alumni.findOne({ email: profile.emails[0].value });
    if (!alumni) {
        alumni = await Alumni.create({
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            email: profile.emails[0].value,
            googleId: profile.id,
            isEmailVerified: true,
        });
    }
    const payload = { id: alumni._id, email: alumni.email, role: 'alumni' };
    const tokens = generateTokens(payload);
    return { alumni, tokens };
};

export const listAlumniDirectory = async (req, res) => {
    try {
        const { search, graduationYear, company, skill, branch, page = 1, limit = 10 } = req.query;

        const filter = { isEmailVerified: true };

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        if (company) {
            filter.companyName = { $regex: company, $options: "i" };
        }

        if (branch) {
            filter["verification.degree"] = { $regex: branch, $options: "i" };
        }

        if (skill) {
            const skillsArray = Array.isArray(skill)
                ? skill
                : String(skill)
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            if (skillsArray.length) {
                filter.skills = { $in: skillsArray };
            }
        }

        if (graduationYear !== undefined) {
            const year = Number(graduationYear);
            if (Number.isNaN(year)) {
                return res.status(400).json({ message: "graduationYear must be a number" });
            }
            filter["verification.graduationYear"] = year;
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const projection = "name email profileImage companyName skills address website portfolioUrl verification.graduationYear verification.degree createdAt";

        const [results, total] = await Promise.all([
            Alumni.find(filter)
                .select(projection)
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            Alumni.countDocuments(filter),
        ]);

        return res.json({
            data: results,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum) || 1,
            },
        });
    } catch (error) {
        console.error("List alumni directory error:", error);
        res.status(500).json({ message: "Failed to load directory" });
    }
};

export const getAlumniPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const alumni = await Alumni.findById(id).select(
            "name email phone address profileImage companyName skills website portfolioUrl verification"
        );

        if (!alumni) {
            return res.status(404).json({ message: "Alumni not found." });
        }

        return res.json(alumni);
    } catch (error) {
        console.error("Get alumni public profile error:", error);
        res.status(500).json({ message: "Failed to load profile" });
    }
};

export const getAlumniProfile = async (req, res) => {
    // The user object is attached to the request by the authMiddleware
    // and already has the password excluded.
    res.json(req.user);
};

export const updateAlumniProfile = async (req, res) => {
    try {
        if (req.user?.role !== 'alumni') {
            return res.status(403).json({ message: "Forbidden" });
        }

        const alumniId = req.user._id;

        const updateData = {};

        const topLevelStrings = ["name", "phone", "address", "website", "portfolioUrl", "companyName"];
        topLevelStrings.forEach((field) => {
            const normalized = normalizeValue(req.body?.[field]);
            if (normalized !== undefined) updateData[field] = normalized;
        });

        const verificationStrings = ["degree", "linkedinUrl", "linkedinId"];
        verificationStrings.forEach((field) => {
            const normalized = normalizeValue(req.body?.[field]);
            if (normalized !== undefined) updateData[`verification.${field}`] = normalized;
        });

        if (req.body?.branch !== undefined) {
            const normalized = normalizeValue(req.body.branch);
            if (normalized !== undefined) {
                updateData["verification.degree"] = normalized;
            }
        }

        const normalizedYear = normalizeNumber(req.body?.graduationYear);
        if (normalizedYear?.error) return res.status(400).json({ message: normalizedYear.error });
        if (normalizedYear !== undefined) updateData["verification.graduationYear"] = normalizedYear;

        // Skills parsing (accept comma string or JSON array)
        if (req.body?.skills !== undefined) {
            let skills = req.body.skills;
            if (typeof skills === "string") {
                if (skills.trim() === "") {
                    skills = [];
                } else {
                    try {
                        skills = skills.trim().startsWith("[")
                            ? JSON.parse(skills)
                            : skills.split(",").map((s) => s.trim()).filter(Boolean);
                    } catch (parseErr) {
                        return res.status(400).json({ message: "Invalid skills format." });
                    }
                }
            }
            if (!Array.isArray(skills)) {
                return res.status(400).json({ message: "Skills must be an array." });
            }
            updateData.skills = skills;
        }

        const profileFile = req.files?.profileImage?.[0] || req.file;
        if (profileFile) {
            const uploadResponse = await imageKit.upload({
                file: profileFile.buffer,
                fileName: `alumni_profile_${alumniId}_${Date.now()}`,
                folder: "alumni_profiles",
                useUniqueFileName: true,
            });
            updateData.profileImage = uploadResponse.url;
        }

        const proofFile = req.files?.proofDocument?.[0];
        if (proofFile) {
            const uploadResponse = await imageKit.upload({
                file: proofFile.buffer,
                fileName: `alumni_proof_${alumniId}_${Date.now()}`,
                folder: "alumni_proofs",
                useUniqueFileName: true,
            });
            updateData["verification.proofUrl"] = uploadResponse.url;
        }

        const updatedAlumni = await Alumni.findByIdAndUpdate(
            alumniId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedAlumni) {
            return res.status(404).json({ message: "Alumni profile not found." });
        }

        res.json({ ...updatedAlumni.toObject(), role: "alumni" });
    } catch (error) {
        console.error("Profile update error:", error);
        const status = error?.name === "CastError" ? 400 : 500;
        res.status(status).json({ message: "Failed to update profile", error: error.message });
    }
};

export const createAlumniStory = async (req, res) => {
    try {
        if (req.user?.role !== "alumni") {
            return res.status(403).json({ message: "Only alumni can post stories" });
        }

        const { title, branch, body } = req.body;
        if (!title || !branch || !body) {
            return res.status(400).json({ message: "title, branch and body are required" });
        }

        const files = req.files?.images || [];
        const uploaded = [];
        for (const file of files.slice(0, 3)) {
            const upload = await imageKit.upload({
                file: file.buffer,
                fileName: `story_${req.user._id}_${Date.now()}_${file.originalname}`,
                folder: "alumni_stories",
                useUniqueFileName: true,
            });
            uploaded.push(upload.url);
        }

        const story = await Story.create({
            title: title.trim(),
            body: body.trim(),
            branch,
            images: uploaded,
            author: req.user._id,
            authorName: req.user.name || "Alumni",
        });

        return res.status(201).json({ data: story });
    } catch (error) {
        console.error("Create alumni story error:", error);
        res.status(500).json({ message: "Failed to post story" });
    }
};

export const listAlumniStories = async (req, res) => {
    try {
        const { search, branch, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (search) {
            filter.authorName = { $regex: search, $options: "i" };
        }
        if (branch) filter.branch = branch;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(30, Math.max(1, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const [stories, total] = await Promise.all([
            Story.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Story.countDocuments(filter),
        ]);

        res.json({
            data: stories,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum) || 1,
            },
        });
    } catch (error) {
        console.error("List alumni stories error:", error);
        res.status(500).json({ message: "Failed to load stories" });
    }
};

export const deleteAlumniStory = async (req, res) => {
    try {
        if (req.user?.role !== "alumni") {
            return res.status(403).json({ message: "Only alumni can delete stories" });
        }

        const { id } = req.params;
        const story = await Story.findById(id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        if (String(story.author) !== String(req.user._id)) {
            return res.status(403).json({ message: "Not allowed" });
        }

        await story.deleteOne();
        return res.json({ message: "Story deleted" });
    } catch (error) {
        console.error("Delete alumni story error:", error);
        return res.status(500).json({ message: "Failed to delete story" });
    }
};

