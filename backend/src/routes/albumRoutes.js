import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyAlbums, createAlbum, updateAlbum, deleteAlbum } from '../controllers/albumController.js';

const router = express.Router();

router.get('/my', protect, getMyAlbums);
router.post('/', protect, createAlbum);
router.put('/:id', protect, updateAlbum);
router.delete('/:id', protect, deleteAlbum);

export default router;
