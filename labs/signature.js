import crypto from 'crypto';

const text = 'dog';
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const data = Buffer.from(text);
const sign = crypto.sign("SHA256", data , privateKey);
const signature = sign.toString('base64');
// console.log(`signature:\n\n ${signature}`);

import QRCode from 'qrcode';
// QRCode.toString(`{data: ${text}, sig: ${signature}`, {type: 'terminal'}, (err, url) => console.log(url));

import Jimp from 'jimp';
import jsQR from 'jsqr';
const qrCodeBuffer = await QRCode.toBuffer(`{"data": "${text}", "sig": "${signature}"}`); // create QR Code
const qrcode = await Jimp.read(qrCodeBuffer); // Read into Image
const result = jsQR(qrcode.bitmap.data, qrcode.bitmap.width, qrcode.bitmap.height); // Decode QR Code from Image
// console.log(result.data);
const json = JSON.parse(result.data); // Parse data from detected QR Code
// console.log(json);

// Check if info decoded is equal to info encoded
console.log('[text]', text.localeCompare(json.text) ? '✅' : '⛔', '|| [signature]', signature === json.sig ? '✅' : '⛔');

// verify signature of original text using public key
console.log('[data integrity]', crypto.verify('SHA256', Buffer.from(text), publicKey, Buffer.from(json.sig, 'base64')) ? '✅' : '⛔');

console.log('done');

