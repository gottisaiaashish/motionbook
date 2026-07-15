import fs from 'fs';
import { FormData, File } from 'formdata-node';
import fetch from 'node-fetch';

const run = async () => {
  const imagePath = 'C:\\Users\\gotti\\Downloads\\WhatsApp Image 2026-07-15 at 4.26.15 PM.jpeg';
  const videoPath = 'C:\\Users\\gotti\\Downloads\\WhatsApp Video 2026-07-15 at 4.26.19 PM.mp4';

  const formData = new FormData();
  formData.append('title', 'WhatsApp Debug Motionbook');
  
  const imgBuffer = fs.readFileSync(imagePath);
  formData.append('image', new File([imgBuffer], 'image.jpeg', { type: 'image/jpeg' }));
  
  const vidBuffer = fs.readFileSync(videoPath);
  formData.append('video', new File([vidBuffer], 'video.mp4', { type: 'video/mp4' }));

  console.log('Sending upload request...');
  const res = await fetch('http://localhost:5000/api/motionbook/upload', {
    method: 'POST',
    headers: {
      'x-debug-user': 'gottisaiaashish@gmail.com'
    },
    body: formData
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
};
run();
