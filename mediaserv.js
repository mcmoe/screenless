import 'dotenv-expand/config'; 
import path from 'node:path';
import express from 'express';
import serveIndex from 'serve-index';
const app = express();

import {fileURLToPath} from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, process.env.ASSETS_DIR);
app.use('/assets', serveIndex(dir));
app.use('/assets', express.static(dir));
app.listen(process.env.MEDIA_SERV_PORT, process.env.MEDIA_SERV_HOST, () => console.log(`Listening on http://${process.env.MEDIA_SERV_HOST}:${process.env.MEDIA_SERV_PORT}`));
