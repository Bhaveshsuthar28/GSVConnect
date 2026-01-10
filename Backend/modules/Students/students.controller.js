import bcrypt from "bcryptjs";
import Student from "./students.models.js";
import { sendOtp, verifyOtp } from "../../shared/Otp/otp.service.js";
import { generateTokens } from "../../shared/auth/token.js";
import { imageKit } from "../../config/image.config.js";

export const registerStudent = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email.endsWith("@gsv.ac.in")) {
            return res.status(400).json({ message: "Only GSV email IDs are allowed for student registration." });
        }

        const emailRegex = /_([a-zA-Z]+)(\d{2})@gsv\.ac\.in$/;
        const match = email.match(emailRegex);

        if (!match) {
            return res.status(400).json({ message: "Invalid email format. Expected format: firstname.lastname_degreeYY@gsv.ac.in" });
        }

        const branch = match[1];
        const graduationYear = parseInt(`20${match[2]}`, 10);

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
            email,
            password: hashedPassword,
            branch: branch,
            year: graduationYear,
        });

        await sendOtp(email);
        res.status(201).json({ message: "Registration successful. OTP sent to your email." });
    } catch (error) {
        console.error("Student Register Error:", error);
        res.status(500).json({ message: error.message });
    }
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
        console.error("Student Verify Error:", error);
        res.status(500).json({ message: error.message });
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
        console.error("Student Login Error:", error);
        res.status(500).json({ message: error.message });
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
    const { name } = req.body;
    const studentId = req.user._id;

    const updateData = {};
    if (name) {
        updateData.name = name;
    }

    try {
        if (req.file) {
            const uploadResponse = await imageKit.upload({
                file: req.file.buffer,
                fileName: `profile_${studentId}`,
                folder: "student_profiles",
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

        res.json(updatedStudent);
    } catch (error) {
        console.error("Error updating student profile:", error);
        res.status(500).json({ message: error.message });
    }
};
