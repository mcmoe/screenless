import 'dotenv-expand/config'; 
import got from 'got';
const askThatThing = async (thing) => {
  const data = await got.post(process.env.GAR_BASE_URL + '/assistant', {
    json: {
      "command": `what is the sound of a ${thing}?`,
      "user": `${process.env.GAR_USER}`,
      "broadcast": false,
      "converse": false
    }
  }).json();

  console.log('[DatTing] log:', data);
  if(data.audio === undefined) { throw new Error('[DatTing] no audio response received') }
  return data.audio;
}

import {promisify} from 'node:util';
import stream from 'node:stream';
import fs from 'node:fs';
const saveThatThing = async (thing, query) => {
  const name = `${process.env.AUDIO_DIR}${thing}-${query.split`v=`[1]}.wav`;
  console.log(`ready to download ${thing} audio: "${query}"`);
  const pipeline = promisify(stream.pipeline);
  await pipeline(
    got.stream(process.env.GAR_BASE_URL + query),
    fs.createWriteStream(name)
  );
  return name;
}

// this will work on linux and mac (you need aplay or afplay)
import Sound from 'aplay';
const playThatThing = (name) => {
  return new Promise((resolve, reject) => {
    const sound = new Sound()
    sound.on('complete', (code, sig) => {
      console.log('[DatTing] play completed -', '[code]:', code, ' [sig]:', sig);
      resolve();
    });
    sound.play(name);
  });
}

// skipCache is an optional named parameter using descturcuring technique and assigning default values of its left hand side
// this can be made more clear that it is a set of "options" using typescript optional param + interface (see speaker.js of node-speaker)
const play = async (thing, {skipCache = false} = {skipCache: false}) => {
  // Algorithm: if find in ${process.env.AUDIO_DIR} files that start with `${thing}-`, skip asking and saving, select one and play it directly...
  const regex = new RegExp(`${thing}-(ar|en|fr)-*\\d*\\.wav`, 'i'); // abc-ar-123.wav TODO -- introduce language options, atm one is randomly picked
  const found = fs.readdirSync(process.env.AUDIO_DIR).filter(f => f.match(regex));

  let name;
  if (skipCache || found.length === 0) { // if none found, ask for one and save it
    console.log('[DatTing] asking...');
    const query = await askThatThing(thing);
    console.log('[DatTing] saving...');
    name = await saveThatThing(thing, query);
    console.log('[DatTing] playing...');  
  } else { // if already exists, randomly pick one
    console.log('[DatTing] thing exists, fetching random variation...');
    const randomIndex = (Math.floor(Math.random() * found.length));
    name = `${process.env.AUDIO_DIR}${found[randomIndex]}`;
    console.log(`[DatTing] random variation: ${name}`);
  }

  await playThatThing(name);
  console.log('[DatTing] should have played dat ting')
}

export default play;
