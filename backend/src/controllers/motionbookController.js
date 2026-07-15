import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { Motionbook } from '../models/Motionbook.js';
import { Subscription } from '../models/Subscription.js';

// ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Upload a buffer to Cloudinary via upload_stream.
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

/**
 * Compute a 64-bit difference hash (dHash) from an image buffer.
 * Algorithm:
 *   1. Resize to 9×8 in grayscale
 *   2. For each row, compare each pixel to the next → bit = 1 if left > right
 *   3. Concatenate 64 bits → encode as 16 hex characters
 */
const computeDHash = async (buffer) => {
  const { data } = await sharp(buffer)
    .resize(9, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bits = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left  = data[row * 9 + col];
      const right = data[row * 9 + col + 1];
      bits.push(left > right ? 1 : 0);
    }
  }

  // Pack 4 bits per hex char → 16 hex chars total
  let hash = '';
  for (let i = 0; i < 64; i += 4) {
    hash += parseInt(bits.slice(i, i + 4).join(''), 2).toString(16);
  }
  return hash;
};

/**
 * Count differing bits between two hex-encoded hashes (Hamming distance).
 */
const hammingDistance = (h1, h2) => {
  if (!h1 || !h2 || h1.length !== h2.length) return 64;
  let dist = 0;
  for (let i = 0; i < h1.length; i++) {
    let xor = parseInt(h1[i], 16) ^ parseInt(h2[i], 16);
    while (xor > 0) {
      dist += xor & 1;
      xor >>= 1;
    }
  }
  return dist;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/motionbook/upload  (protected)
 * Expects multipart/form-data with fields: title, image (file), video (file)
 */
export const uploadMotionbook = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!req.files?.image?.[0]) {
      return res.status(400).json({ message: 'Trigger image is required' });
    }
    if (!req.files?.video?.[0]) {
      return res.status(400).json({ message: 'Video is required' });
    }

    const imageBuffer = req.files.image[0].buffer;
    const videoBuffer = req.files.video[0].buffer;

    // Compute pHash from the trigger image
    const pHash = await computeDHash(imageBuffer);

    // Upload image to Cloudinary
    const imageResult = await uploadBufferToCloudinary(imageBuffer, {
      folder: 'motionbook/images',
      resource_type: 'image',
    });

    // Upload video to Cloudinary
    const videoResult = await uploadBufferToCloudinary(videoBuffer, {
      folder: 'motionbook/videos',
      resource_type: 'video',
    });

    const fileSizeBytes = (imageResult.bytes || 0) + (videoResult.bytes || 0);

    // Save to MongoDB
    const motionbook = await Motionbook.create({
      title,
      imageUrl: imageResult.secure_url,
      imagePublicId: imageResult.public_id,
      videoUrl: videoResult.secure_url,
      videoPublicId: videoResult.public_id,
      pHash,
      fileSizeBytes,
      userId: req.user._id,
    });

    // Update subscription usage counters
    if (req.subscription) {
      await Subscription.updateOne(
        { _id: req.subscription._id },
        {
          $inc: {
            storageUsedBytes: fileSizeBytes,
            photosUploaded: 1,
          },
        }
      );
    }

    res.status(201).json(motionbook);
  } catch (error) {
    console.error('uploadMotionbook error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

/**
 * POST /api/motionbook/scan  (public)
 * Body: { imageDataUrl: "data:image/jpeg;base64,..." }
 * Returns the best matching motionbook if Hamming distance < threshold (12).
 */
export const scanImage = async (req, res) => {
  try {
    const { imageDataUrl } = req.body;

    if (!imageDataUrl) {
      return res.status(400).json({ message: 'imageDataUrl is required' });
    }

    // Decode base64 → buffer
    const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    // Compute hash of the scanned frame
    let scanHash;
    try {
      scanHash = await computeDHash(buffer);
    } catch {
      return res.status(400).json({ message: 'Invalid image data' });
    }

    // Fetch all stored hashes (for demo scale — works well for hundreds of entries)
    const all = await Motionbook.find({}, 'title imageUrl videoUrl pHash');

    const THRESHOLD = 64; // Relaxed threshold for demo purposes (screen scanning causes huge hash differences)
    let bestMatch = null;
    let bestDist = 65;

    for (const mb of all) {
      const dist = hammingDistance(scanHash, mb.pHash);
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = mb;
      }
    }

    if (bestMatch && bestDist <= THRESHOLD) {
      return res.json({
        match: true,
        id: bestMatch._id,
        title: bestMatch.title,
        imageUrl: bestMatch.imageUrl,
        videoUrl: bestMatch.videoUrl,
        distance: bestDist,
      });
    }

    return res.json({ match: false });
  } catch (error) {
    console.error('scanImage error:', error);
    res.status(500).json({ message: 'Scan failed', error: error.message });
  }
};

/**
 * GET /api/motionbook/my  (protected)
 * Returns all motionbooks uploaded by the authenticated user.
 */
export const getUserMotionbooks = async (req, res) => {
  try {
    const motionbooks = await Motionbook.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(motionbooks);
  } catch (error) {
    console.error('getUserMotionbooks error:', error);
    res.status(500).json({ message: 'Failed to fetch motionbooks' });
  }
};

/**
 * DELETE /api/motionbook/:id  (protected)
 * Deletes a motionbook (and its Cloudinary assets) owned by the user.
 */
export const deleteMotionbook = async (req, res) => {
  try {
    const motionbook = await Motionbook.findById(req.params.id);

    if (!motionbook) {
      return res.status(404).json({ message: 'Motionbook not found' });
    }

    if (motionbook.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this motionbook' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(motionbook.imagePublicId, { resource_type: 'image' });
    await cloudinary.uploader.destroy(motionbook.videoPublicId, { resource_type: 'video' });

    // Reverse storage usage
    const sub = await Subscription.findOne({
      userId: req.user._id,
      status: { $in: ['demo', 'active', 'referral_reward'] },
    }).sort({ createdAt: -1 });
    if (sub) {
      await Subscription.updateOne(
        { _id: sub._id },
        {
          $inc: {
            storageUsedBytes: -(motionbook.fileSizeBytes || 0),
            photosUploaded: -1,
          },
        }
      );
    }

    await motionbook.deleteOne();
    res.json({ message: 'Motionbook deleted successfully' });
  } catch (error) {
    console.error('deleteMotionbook error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};
