import bcrypt from "bcryptjs";
import Student from "./students.models.js";
import { sendOtp, verifyOtp } from "../../shared/Otp/otp.service.js";
import { generateTokens } from "../../shared/auth/token.js";
import { imageKit } from "../../config/image.config.js";
import { getAuthCookieOptions } from "../../shared/auth/cookies.js";

const STUDENT_EMAIL_REGEX = /^[a-zA-Z0-9.]+_([a-zA-Z]+)(\d{2})@gsv\.ac\.in$/i;

const parseStudentEmail = (rawEmail) => {
    const email = String(rawEmail || "").trim();
    if (!email) return { ok: false, message: "Email is required." };

    const match = email.match(STUDENT_EMAIL_REGEX);
    if (!match) {
        return {
            ok: false,
            message: "Invalid student email format. Expected: name_branchYY@gsv.ac.in (e.g. john_cse24@gsv.ac.in)",
        };
    }

    const branch = match[1];
    const graduationYear = parseInt(`20${match[2]}`, 10);

    return { ok: true, email, branch, graduationYear };
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

export const registerStudent = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const parsed = parseStudentEmail(email);
        if (!parsed.ok) {
            return res.status(400).json({ message: parsed.message });
        }

        const branch = parsed.branch;
        const graduationYear = parsed.graduationYear;

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            if (existingStudent.isEmailVerified) {
                return res.status(409).json({ message: "Student with this email already exists." });
            } else {
                // Update existing unverified student
                const hashedPassword = await bcrypt.hash(password, 12);
                existingStudent.name = name;
                existingStudent.password = hashedPassword;
                existingStudent.branch = branch;
                existingStudent.year = graduationYear;
                await existingStudent.save();

                await sendOtp(email);
                return res.status(200).json({ message: "Resent OTP to your email." });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await Student.create({
            name,
            email: parsed.email,
            password: hashedPassword,
            branch: branch,
            year: graduationYear,
        });

        await sendOtp(email);
        res.status(201).json({ message: "Registration successful. OTP sent to your email." });
    } catch (error) {
        console.error("Student Register Error:", error);
        const status = error?.status || 500;
        res.status(status).json({ message: status === 500 ? "Registration failed." : error.message });
    }
};

export const googleStudentLogin = async (profile) => {
    const email = profile?.emails?.[0]?.value;
    const parsed = parseStudentEmail(email);
    if (!parsed.ok) {
        const err = new Error(parsed.message);
        err.status = 400;
        throw err;
    }

    const displayName = profile?.displayName?.trim();
    const given = profile?.name?.givenName;
    const family = profile?.name?.familyName;
    const name = displayName || `${given || ""} ${family || ""}`.trim() || parsed.email.split("@")[0];

    let student = await Student.findOne({ email: parsed.email });
    if (!student) {
        student = await Student.create({
            name,
            email: parsed.email,
            googleId: profile?.id,
            isEmailVerified: true,
            branch: parsed.branch,
            year: parsed.graduationYear,
        });
    } else {
        const update = {};
        if (!student.isEmailVerified) update.isEmailVerified = true;
        if (!student.googleId) update.googleId = profile?.id;
        if (!student.branch) update.branch = parsed.branch;
        if (!student.year) update.year = parsed.graduationYear;
        if (!student.name && name) update.name = name;

        if (Object.keys(update).length) {
            student = await Student.findByIdAndUpdate(student._id, { $set: update }, { new: true });
        }
    }

    const payload = { id: student._id, email: student.email, role: "student" };
    const tokens = generateTokens(payload);
    return { student, tokens };
};

export const verifyStudentEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const isValid = await verifyOtp(email, otp);

        if (!isValid) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        const student = await Student.findOneAndUpdate(
            { email },
            { $set: { isEmailVerified: true } },
            { new: true }
        );

        const payload = { id: student._id, email: student.email, name: student.name, role: 'student' };
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

        res.json({ message: "Email verified successfully.", role: "student" });
    } catch (error) {
        console.error("Student Verify Error:", error);
        res.status(500).json({ message: "Verification failed." });
    }
};

export const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email }).select("+password");

        if (!student || !(await bcrypt.compare(password, student.password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (!student.isEmailVerified) {
            return res.status(403).json({ message: "Please verify your email first." });
        }

        const payload = { id: student._id, email: student.email, name: student.name, role: 'student' };
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

        res.json({ message: "Login successful", role: "student" });
    } catch (error) {
        console.error("Student Login Error:", error);
        res.status(500).json({ message: "Login failed." });
    }
};

export const getStudentProfile = async (req, res) => {
    // The user object is attached to the request by the authMiddleware
    // and already has the password excluded.
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStudentProfile = async (req, res) => {
    try {
        if (req.user?.role !== 'student') {
            return res.status(403).json({ message: "Forbidden" });
        }

        const studentId = req.user._id;
        const updateData = {};

        const stringFields = ["name", "phone", "address", "portfolioUrl", "linkedinId", "degree", "branch"];
        stringFields.forEach((field) => {
            const normalized = normalizeValue(req.body?.[field]);
            if (normalized !== undefined) updateData[field] = normalized;
        });

        if (req.body?.cgpa !== undefined) {
            const cgpaVal = req.body.cgpa === "" ? null : Number(req.body.cgpa);
            if (cgpaVal !== null) {
                if (Number.isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
                    return res.status(400).json({ message: "CGPA must be a number between 0 and 10." });
                }
            }
            updateData.cgpa = cgpaVal;
        }

        // Skills can arrive as comma-separated string or JSON array
        if (req.body?.skills !== undefined) {
            let skills = req.body.skills;
            if (typeof skills === "string") {
                if (skills.trim() === "") {
                    skills = [];
                } else {
                    try {
                        // Accept JSON array string or comma separated
                        skills = skills.trim().startsWith("[") ? JSON.parse(skills) : skills.split(",").map((s) => s.trim()).filter(Boolean);
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

        const profileFile = req.file || req.files?.profileImage?.[0];
        if (profileFile) {
            const uploadResponse = await imageKit.upload({
                file: profileFile.buffer,
                fileName: `student_profile_${studentId}_${Date.now()}`,
                folder: "student_profiles",
                useUniqueFileName: true,
            });
            updateData.profileImage = uploadResponse.url;
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found." });
        }

        res.json({ ...updatedStudent.toObject(), role: "student" });
    } catch (error) {
        console.error("Error updating student profile:", error);
        const status = error?.name === "CastError" ? 400 : 500;
        res.status(status).json({ message: error.message || "Failed to update student profile." });
    }
};
