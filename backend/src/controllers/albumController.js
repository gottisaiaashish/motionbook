import { Album } from '../models/Album.js';
import { Motionbook } from '../models/Motionbook.js';
import { Subscription } from '../models/Subscription.js';
import { v2 as cloudinary } from 'cloudinary';

// GET /api/albums/my
export const getMyAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch albums' });
  }
};

// POST /api/albums
export const createAlbum = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    
    // Check subscription limits for albums
    const sub = await Subscription.findOne({
      userId: req.user._id,
      status: { $in: ['active', 'demo', 'referral_reward'] }
    }).populate('planId');

    const bypassLimits = req.user && req.user.email === 'gottisaiaashish@gmail.com';

    if (!bypassLimits) {
      if (!sub || !sub.planId) {
        return res.status(403).json({ message: 'No active subscription found' });
      }

      if (sub.albumsCreated >= sub.planId.maxAlbums) {
        return res.status(403).json({ message: `Album limit reached (${sub.planId.maxAlbums})` });
      }
    }


    const album = await Album.create({
      name,
      description,
      type: type || 'personal',
      userId: req.user._id,
      subscriptionId: sub ? sub._id : null,
    });

    if (sub) {
      await Subscription.updateOne({ _id: sub._id }, { $inc: { albumsCreated: 1 } });
    }

    res.status(201).json(album);

  } catch (error) {
    res.status(500).json({ message: 'Failed to create album' });
  }
};

// PUT /api/albums/:id
export const updateAlbum = async (req, res) => {
  try {
    const { name, description } = req.body;
    const album = await Album.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, description },
      { new: true }
    );
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.json(album);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update album' });
  }
};

// DELETE /api/albums/:id
export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findOne({ _id: req.params.id, userId: req.user._id });
    if (!album) return res.status(404).json({ message: 'Album not found' });

    // Find all motionbooks in this album
    const motionbooks = await Motionbook.find({ albumId: album._id });

    let totalBytesDeleted = 0;
    
    // Delete all motionbooks in the album from cloudinary
    for (const mb of motionbooks) {
      await cloudinary.uploader.destroy(mb.imagePublicId, { resource_type: 'image' }).catch(console.error);
      await cloudinary.uploader.destroy(mb.videoPublicId, { resource_type: 'video' }).catch(console.error);
      totalBytesDeleted += (mb.fileSizeBytes || 0);
    }

    // Delete motionbooks from DB
    await Motionbook.deleteMany({ albumId: album._id });

    // Reverse storage usage and albums count
    if (album.subscriptionId) {
      await Subscription.updateOne(
        { _id: album.subscriptionId },
        { 
          $inc: { 
            albumsCreated: -1,
            photosUploaded: -motionbooks.length,
            storageUsedBytes: -totalBytesDeleted 
          } 
        }
      );
    }

    await album.deleteOne();
    res.json({ message: 'Album and all its motionbooks deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete album' });
  }
};
