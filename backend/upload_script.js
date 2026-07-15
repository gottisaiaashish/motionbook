import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

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

  let hash = '';
  for (let i = 0; i < 64; i += 4) {
    hash += parseInt(bits.slice(i, i + 4).join(''), 2).toString(16);
  }
  return hash;
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Use MONGO_URI from .env
    console.log('Connected to DB');

    const users = mongoose.connection.collection('users');
    const user = await users.findOne({ email: 'gottisaiaashish@gmail.com' });
    if (!user) throw new Error('User not found');
    console.log('User found:', user._id);

    const imagePath = 'C:\\Users\\gotti\\Downloads\\WhatsApp Image 2026-07-15 at 4.26.15 PM.jpeg';
    const videoPath = 'C:\\Users\\gotti\\Downloads\\WhatsApp Video 2026-07-15 at 4.26.19 PM.mp4';

    const imageBuffer = fs.readFileSync(imagePath);
    const videoBuffer = fs.readFileSync(videoPath);

    console.log('Computing hash...');
    const pHash = await computeDHash(imageBuffer);
    console.log('pHash:', pHash);

    console.log('Uploading image...');
    const imageResult = await uploadBufferToCloudinary(imageBuffer, {
      folder: 'motionbook/images',
      resource_type: 'image',
    });

    console.log('Uploading video...');
    const videoResult = await uploadBufferToCloudinary(videoBuffer, {
      folder: 'motionbook/videos',
      resource_type: 'video',
    });

    const fileSizeBytes = (imageResult.bytes || 0) + (videoResult.bytes || 0);

    const motionbooks = mongoose.connection.collection('motionbooks');
    const result = await motionbooks.insertOne({
      title: 'WhatsApp Upload',
      imageUrl: imageResult.secure_url,
      imagePublicId: imageResult.public_id,
      videoUrl: videoResult.secure_url,
      videoPublicId: videoResult.public_id,
      pHash,
      fileSizeBytes,
      userId: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Motionbook created:', result.insertedId);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
