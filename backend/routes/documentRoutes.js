import express, { application } from 'express';
import crypto from 'crypto';
import protect from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import upload from '../config/multer.js'
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    getDocumentFileUrl
} from '../controllers/documentController.js';
import { streamDocument } from '../controllers/documentController.js';

const router=express.Router();

if (process.env.NODE_ENV !== 'production') {
    router.get('/debug/file-url', async (req, res) => {
        const publicId = req.query.publicId;
        if (!publicId) return res.status(400).json({ success: false, error: 'publicId query param required' });
        try {
            // Manually build signed download URL (avoid SDK adding empty params)
            const timestamp = Math.floor(Date.now() / 1000);
            const stringToSign = `public_id=${publicId}&timestamp=${timestamp}`;
            const signature = crypto.createHmac('sha1', process.env.CLOUDINARY_API_SECRET).update(stringToSign).digest('hex');
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.CLOUDINARY_API_KEY;
            const signed = `https://api.cloudinary.com/v1_1/${cloudName}/image/download?public_id=${encodeURIComponent(publicId)}&timestamp=${timestamp}&signature=${signature}&api_key=${apiKey}`;
            // Quick HEAD check; if not accessible, return the public secure_url if known via query param (optional)
            try {
                const resp = await fetch(signed, { method: 'HEAD' });
                if (resp.ok) return res.json({ success: true, url: signed });
            } catch (e) {
                console.warn('debug HEAD failed', e && e.message ? e.message : e);
            }
            // Allow falling back to ?secureUrl=... query param when testing
            if (req.query.secureUrl) return res.json({ success: true, url: req.query.secureUrl });
            return res.status(500).json({ success: false, error: 'Signed URL inaccessible' });
        } catch (err) {
            console.error('debug signed url error', err);
            return res.status(500).json({ success: false, error: 'Failed to generate signed URL' });
        }
    });
}

router.use(protect);
router.post('/upload',upload.single('file'),uploadDocument);
router.get('/',getDocuments);
router.get('/:id',getDocument);
router.get('/:id/file-url', getDocumentFileUrl);
router.get('/:id/stream', streamDocument);
router.delete('/:id',deleteDocument);

export default router;
