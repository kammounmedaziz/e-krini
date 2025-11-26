import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDirKyc = path.join(__dirname, '../../uploads/kyc');
const uploadDirAgency = path.join(__dirname, '../../uploads/agency');
const uploadDirInsurance = path.join(__dirname, '../../uploads/insurance');

[uploadDirKyc, uploadDirAgency, uploadDirInsurance].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirKyc);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp and random string
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);
        cb(null, `${basename}-${uniqueSuffix}${extension}`);
    }
});

const agencyStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirAgency);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);
        cb(null, `${basename}-${uniqueSuffix}${extension}`);
    }
});

const insuranceStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirInsurance);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);
        cb(null, `${basename}-${uniqueSuffix}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed file types for KYC documents
    const allowedTypes = /jpeg|jpg|png|pdf|gif|bmp|tiff/;
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'application/pdf'
    ];

    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimes.includes(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${allowedMimes.join(', ')}`));
    }
};

export const uploadKycDocuments = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 6 // Maximum 6 files (5 documents + 1 selfie)
    },
    fileFilter: fileFilter
}).array('documents', 6);

export const uploadSingleDocument = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: fileFilter
}).single('document');

// Agency documents upload middleware
export const uploadAgencyDocs = multer({
    storage: agencyStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 3 // businessLicense, insuranceCertificate, taxDocument
    },
    fileFilter: fileFilter
}).fields([
    { name: 'businessLicense', maxCount: 1 },
    { name: 'insuranceCertificate', maxCount: 1 },
    { name: 'taxDocument', maxCount: 1 }
]);

// Insurance documents upload middleware
export const uploadInsuranceDocs = multer({
    storage: insuranceStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 10 // insuranceLicense + multiple certificationDocs
    },
    fileFilter: fileFilter
}).fields([
    { name: 'insuranceLicense', maxCount: 1 },
    { name: 'certificationDocs', maxCount: 10 }
]);

// Helper function to get file URL
export const getFileUrl = (filename, type = 'kyc') => {
    return `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${type}/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filename, type = 'kyc') => {
    const uploadDir = type === 'agency' ? uploadDirAgency : 
                      type === 'insurance' ? uploadDirInsurance : 
                      uploadDirKyc;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};