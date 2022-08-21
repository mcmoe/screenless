import 'dotenv-expand/config';
import Jimp from 'jimp';

const qrcode = (await Jimp.read(`${process.env.QRC_DIR}qr-dinosaur.png`)).resize(150, 150);
const image = await Jimp.read(`${process.env.IMG_DIR}dinosaur-410859.jpeg`);

image.composite(qrcode, 2, 2, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacityDest: 1,
    opacitySource: 0.5
})
await image.writeAsync(`${process.env.QRC_DIR}tests/atest-${Date.now()}.png`);
console.log("Image is processed successfully");
