import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
const sourceImage = 'C:\\Users\\Mame PC Clinic\\.gemini\\antigravity\\brain\\1e549aa7-62eb-41b3-8111-d83aba949d5d\\agrilink_ethiopian_farmer_logo_1776630545385.png';

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir);
    console.log('✅ Created frontend/public directory');
}

// Check if source image exists
if (fs.existsSync(sourceImage)) {
    // Copy the images
    fs.copyFileSync(sourceImage, path.join(publicDir, 'pwa-192x192.png'));
    fs.copyFileSync(sourceImage, path.join(publicDir, 'pwa-512x512.png'));
    console.log('✅ Successfully copied PWA App Icons into the public folder!');
} else {
    console.log('❌ Error: Could not find the AI generated image. Did you delete it?');
}
