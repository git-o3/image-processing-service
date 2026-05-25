import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import { AppError } from "../../../../shared/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../../../../data/originals");

// to ensure the directory exists inside the container on boot
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        //generate a secure, unique hex string to preven collision on disk
        const uniqueSuffix = crypto.randomBytes(16).toString("hex");
        //keep the original extension intact(.jpg. png, etc)
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}`);
    }
});

// strict file type filtering for images
const fileFilter = function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimeType);

    if (extName && mimeType) {
        return cb(null, true)
    }
    cb(new AppError("Only image files (JPEG, JPG, PNG, WEBP) are allowed."));
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10mb file size ceiling
    }
});

export default upload;

