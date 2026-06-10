import 'dotenv/config';
import fs from 'fs';
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import jwt from 'jsonwebtoken';

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  let user = await User.findOne({ email: 'gottisaiaashish@gmail.com' });
  if (!user) {
     user = await User.findOne({});
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  console.log("Got token:", token.substring(0, 20) + "...");

  // Write token to a file to use with curl
  fs.writeFileSync('test_token.txt', token);

  // create a dummy image and video
  fs.writeFileSync('dummy.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
  fs.writeFileSync('dummy.mp4', Buffer.from('AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACsltZGF0', 'base64'));
  
  console.log("Ready. Run: curl -X POST -H 'Authorization: Bearer <token>' -F 'title=Test' -F 'image=@dummy.png' -F 'video=@dummy.mp4' http://localhost:5000/api/motionbook/upload");
  process.exit(0);
}
test();
