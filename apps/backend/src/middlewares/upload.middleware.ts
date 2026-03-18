// config/multer.ts
import multer from "multer";
import fs from "fs";
import path from "path";

// Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Define all upload directories
const UPLOAD_DIRECTORIES = {
  AVATARS: path.join(process.cwd(), "uploads", "avatars"),
  JD: path.join(process.cwd(), "uploads", "jd"),
  RESUMES: path.join(process.cwd(), "uploads", "resumes"),
  MEDIA: path.join(process.cwd(), "uploads", "media"),
};

// Create all directories on initialization
Object.values(UPLOAD_DIRECTORIES).forEach((dir) => {
  ensureDirectoryExists(dir);
});

// ================ Storage Configurations ================

const createStorage = (uploadDir: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, "_");
      cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    },
  });
};

// ================ File Filter Configurations ================

const FileFilters = {
  // Avatar: Images only
  avatar: (
    _req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files (JPEG, PNG, GIF, WebP) are allowed for avatars",
        ),
      );
    }
  },

  // Job Descriptions: PDF only
  jd: (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed for job descriptions"));
    }
  },

  // Resumes: PDF and DOC/DOCX
  resume: (
    _req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files allowed for resumes"));
    }
  },

  // Media: All common file types
  media: (
    _req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowedMimes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      // Videos
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      // Audio
      "audio/mpeg",
      "audio/wav",
      "audio/aac",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file type. Allowed: images, documents, videos, audio",
        ),
      );
    }
  },
};

// ================ Upload Configuration Objects ================

export const uploadAvatar = multer({
  storage: createStorage(UPLOAD_DIRECTORIES.AVATARS),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: FileFilters.avatar,
});

export const uploadJD = multer({
  storage: createStorage(UPLOAD_DIRECTORIES.JD),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: FileFilters.jd,
});

export const uploadResume = multer({
  storage: createStorage(UPLOAD_DIRECTORIES.RESUMES),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: FileFilters.resume,
});

export const uploadMedia = multer({
  storage: createStorage(UPLOAD_DIRECTORIES.MEDIA),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: FileFilters.media,
});

// ================ Additional Convenience Functions ================

// Single file upload with dynamic type
export const uploadSingle = (type: "avatar" | "jd" | "resume" | "media") => {
  const configs = {
    avatar: uploadAvatar,
    jd: uploadJD,
    resume: uploadResume,
    media: uploadMedia,
  };
  return configs[type].single(type);
};

// Multiple files upload with dynamic type
export const uploadMultiple = (
  type: "avatar" | "jd" | "resume" | "media",
  maxCount = 10,
) => {
  const configs = {
    avatar: uploadAvatar,
    jd: uploadJD,
    resume: uploadResume,
    media: uploadMedia,
  };
  return configs[type].array(type, maxCount);
};

// Any file upload (uses media filter)
export const uploadAny = multer({
  storage: createStorage(UPLOAD_DIRECTORIES.MEDIA),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: FileFilters.media,
});

// ================ Export Everything ================

export default {
  // Individual upload configs
  uploadAvatar,
  uploadJD,
  uploadResume,
  uploadMedia,
  uploadAny,

  // Convenience functions
  uploadSingle,
  uploadMultiple,

  // Constants
  UPLOAD_DIRECTORIES,
  FileFilters,
};
