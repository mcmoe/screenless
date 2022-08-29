import 'dotenv-expand/config';
import Sound from 'aplay';
import got from 'got';
import {promisify} from 'node:util';
import stream from 'node:stream';
import fs from 'node:fs';

const speechThat = async (text) => {
  const file = `${process.env.AUDIO_DIR}tmp.wav`;
  const pipeline = promisify(stream.pipeline);
  await pipeline(
    got.stream(`http://localhost:5002/api/tts?text=${text}`),
    fs.createWriteStream(file)
  );
  return file;
}

const playThat = (file) => {
  return new Promise((resolve, reject) => {
    const sound = new Sound()
    sound.on('complete', (code, sig) => {
      console.log('[DatTing] play completed -', '[code]:', code, ' [sig]:', sig);
      resolve();
    });
    sound.play(file);
  });
};

export const speak = async (text) => {
    const file = await speechThat(text);
    await playThat(file);
}

// speak('this is a dog');