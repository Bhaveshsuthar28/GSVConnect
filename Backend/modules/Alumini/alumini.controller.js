import bcrypt from "bcryptjs";
import Alumni from "./alumini.models.js";
import { sendOtp, verifyOtp } from "../../shared/Otp/otp.service.js"
import { imageKit } from "../../config/image.config.js";
import { generateTokens } from "../../shared/auth/token.js";

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
        res.status(500).json({ message: error.message });
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

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 40 * 60 * 1000, 
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 24 * 60 * 60 * 1000, 
        });

        res.json({ message: "Email verified successfully.", ...tokens });
    } catch (error) {
        console.error("Alumni Verify Error:", error);
        res.status(500).json({ message: error.message });
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

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 40 * 60 * 1000, // 40 minutes calls
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        });

        res.json({ message: "Login successful", ...tokens });
    } catch (error) {
        console.error("Alumni Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const uploadProof = async (req, res) => {
    const upload = await imageKit.upload({
        file: req.body.file,
        fileName: "proof.jpg",
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

export const getAlumniProfile = async (req, res) => {
    // The user object is attached to the request by the authMiddleware
    // and already has the password excluded.
    res.json(req.user);
};

export const updateAlumniProfile = async (req, res) => {
    try {
        console.log("Update Alumni Profile Request Body:", req.body);
        console.log("Update Alumni Profile Files:", req.files ? Object.keys(req.files) : "No files");

        const { name, graduationYear, degree, linkedinUrl, phone, address, website } = req.body;
        const alumniId = req.user._id;

        const updateData = {};
        
        // Only update fields if they are explicitly provided in the request
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (website !== undefined) updateData.website = website;
        
        // Handle verification fields
        if (degree !== undefined) updateData["verification.degree"] = degree;
        if (linkedinUrl !== undefined) updateData["verification.linkedinUrl"] = linkedinUrl;

        // Handle graduationYear specially because it is a Number type
        // Sending "" (empty string) for a Number field causes CastError in Mongoose
        if (graduationYear !== undefined) {
            if (graduationYear === '') {
                updateData["verification.graduationYear"] = null;
            } else {
                updateData["verification.graduationYear"] = graduationYear;
            }
        }

        // Check file uploads
        if (req.files) {
             if (req.files.profileImage && req.files.profileImage[0]) {
                const profileImgFile = req.files.profileImage[0];
                const uploadResponse = await imageKit.upload({
                    file: profileImgFile.buffer,
                    fileName: `profile_${alumniId}_${Date.now()}`,
                    folder: "alumni_profiles",
                });
                updateData.profileImage = uploadResponse.url;
             }
             if (req.files.proofDocument && req.files.proofDocument[0]) {
                const proofFile = req.files.proofDocument[0];
                const uploadResponse = await imageKit.upload({
                    file: proofFile.buffer,
                    fileName: `proof_${alumniId}_${Date.now()}`,
                    folder: "alumni_proofs",
                });
                updateData["verification.proofUrl"] = uploadResponse.url;
             }
        }

        const updatedAlumni = await Alumni.findByIdAndUpdate(
            alumniId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedAlumni) {
            return res.status(404).json({ message: "Alumni profile not found." });
        }

        console.log("Updated Alumni Profile:", updatedAlumni);
        res.json(updatedAlumni);
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
};

