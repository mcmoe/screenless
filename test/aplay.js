import 'dotenv-expand/config';
import Sound from 'aplay';

const sound = new Sound();
sound.on('complete', () => { console.log('completed a play'); });

const tracks = ['ding', 'dog-ar', 'ding', 'dog-en', 'ding', 'dog-fr'];
const interval = setInterval(() => {
    if(tracks.length === 0) { clearInterval(interval); return; }
    sound.stop() && sound.play(`${process.env.AUDIO_DIR}${tracks.shift()}.wav`);
}, 1000);

// with ability to pause/resume:
//   music.play(...);
//   music.pause();
//   music.resume();
