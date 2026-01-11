import multer from "multer";

const storage = multer.memoryStorage();

// Allow only images and PDFs; keep error messages JSON-friendly
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/" ) || file.mimetype === "application/pdf") {
        return cb(null, true);
    }

    const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
    err.message = "Only images and PDF files are allowed.";
    return cb(err, false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Wrap multer to return JSON instead of crashing the request
const withMulterErrors = (uploader) => (req, res, next) => {
    uploader(req, res, (err) => {
        if (!err) return next();

        const status = err instanceof multer.MulterError ? 400 : 400;
        return res.status(status).json({ message: err.message || "File upload failed." });
    });
};

export const uploadSingle = (fieldName) => withMulterErrors(upload.single(fieldName));
export const uploadFields = (fields) => withMulterErrors(upload.fields(fields));
export const uploadAny = () => withMulterErrors(upload.any());

// Keep raw upload available if needed elsewhere
export { upload };
