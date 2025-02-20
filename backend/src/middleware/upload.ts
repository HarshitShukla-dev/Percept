import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(null, false);
        cb(new Error('Only audio files are allowed!'));
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});