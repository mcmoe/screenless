import 'dotenv-expand/config';
import QRCode from 'qrcode';
import { createClient } from 'pexels';
import http from "http";
import Jimp from 'jimp';

const host = '0.0.0.0';
const port = 8000;

const overlay = async (origQrcode, image, imageName) => {
  const qrcode = origQrcode.resize(150, 150);
  image.composite(qrcode, 2, 2, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacityDest: 1,
    opacitySource: 0.5
  });
  
  const fileName = `${process.env.IMG_DIR}blended/qr-${imageName}.png`;
  await image.writeAsync(fileName);
  console.log("Image is processed successfully"); // TODO remove
  return fileName;
}

const pexelsClient = createClient(process.env.API_KEY_PEXELS);
const findPhoto = async (query) => {
  const photo = await pexelsClient.photos.search({ query, per_page: 1 }).then(photos => {
      if(photos.total_results > 0) {
          return { imageId: photos.photos[0].id, imageUrl: photos.photos[0].src.medium };
      } else {
        return { }; // TODO - deal with this, make sure the rest of the code does not crash as a result - throw new Errror('...')?
      }
  });
  return photo;
}

const requestListener = async function (req, res) {
  if(req.url === '/favicon.ico') {
    console.log('fav return...');
    return res.end('');
  }
  const text = decodeURIComponent(req.url.split`/`[1]);
  console.log(`generating qrcode for: ${text}`);
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);

let finalImageUrl = `http://${process.env.MEDIA_SERV_HOST}:${process.env.MEDIA_SERV_PORT}/${process.env.IMG_DIR}letsdoit-5191387.jpg`
if(text && text.length > 0) {
    QRCode.toFile(`${process.env.QRC_DIR}/qr-${text}.png`, text);  // saving to disk for future reference
    const qrCodeBuffer = await QRCode.toBuffer(text);
    const qrcode = await Jimp.read(qrCodeBuffer);

    // TODO should fallback to only QRCode if image cannot be retrieved for whatever reason
    const { imageId, imageUrl } = await findPhoto(text); // TODO chain a catch error?
    const image = await Jimp.read(imageUrl);
    image.writeAsync(`${process.env.IMG_DIR}${text}-${imageId}.png`); // saving to disk for future reference

    const fileName = await overlay(qrcode, image, `${text}-${imageId}`); // refactor the multiple refrences to text-imageId
    finalImageUrl = `http://${process.env.MEDIA_SERV_HOST}:${process.env.MEDIA_SERV_PORT}/${fileName}`; // TODO - USE EXPRESS to deploy static content from this server
  }

  // TODO use templating engine ?handlebars?
  res.end(`<html><body style="display: flex;flex-direction: column;align-items: center;">`+
      `<input id="text" style="text-align: center;width: 100%;height: 50px;font-size: xx-large;">` +
      `<button onclick="location.href=getElementById('text').value" style="margin: 5px;width: 100%;height: 50px;font-size: xx-large;">Generate</button>` +
      `<h1 style="text-align: center;width: 100%;">${text}</h1>` +
      `<img src="${finalImageUrl}" style="width: 100%;">` +
      // `<img src="${await findPhoto(text)}" style="width: 100%;">` +
    `</body></html>`);
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
