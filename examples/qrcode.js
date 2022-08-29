const text = 'I wondered if you might scan this, send me an email id you do to holla@mcmoe.com';
import QRCode from 'qrcode';
// QRCode.toString(`${text}`, { type: 'terminal', color: { dark:"#010599FF", light:"#FFBF60FF" } }, (err, url) => console.log(url));
QRCode.toDataURL(`${text}`, { color: { dark:"#343434", light:"#FFFFFF" } }, (err, url) => console.log(url));
console.log('done');
