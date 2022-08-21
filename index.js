import 'dotenv-expand/config'; // this declaration works for OPENCV_BUILD_ROOT (import * dotenv ... does not!)
// REMEMBER to set env variable OPENCV_BUILD_ROOT (equal to wherever you installed the opencv build)
import cv from '@u4/opencv4nodejs';
import jsQR from 'jsqr';
import Sound from 'aplay';
import play from './gsoundof.js';

const sound = new Sound();
const ding = () => {  
  sound.stop();
  sound.play(`${process.env.AUDIO_DIR}ding.wav`);
}

const vCap = new cv.VideoCapture(0);
const delay = 10;
let mostRecentData = '';

const GREEN_BGR = new cv.Vec3(0, 255, 0);
const RED_BGR = new cv.Vec3(0, 0, 255);
const thickness = 2;

const FPS = 60;
const MSEC_PER_FRAME = 1000/FPS;

const frameCapture = async () => {
  let frameMat = vCap.read();
  if (frameMat.empty) {
    vCap.reset();
    frameMat = vCap.read();
  }

  let matRGBA = frameMat.cvtColor(cv.COLOR_BGR2RGBA); // one thing I can do is resize down and see if it improve speed
  let code = jsQR(matRGBA.getData(), matRGBA.cols, matRGBA.rows, undefined);

  if(code !== null) {
    decorateCode(code, frameMat);
  }

  cv.imshow('Video Capture', frameMat);

  let forgetterTimer;
  if(code !== null && mostRecentData !== code.data) {
    ding();
    console.log('code', code);
    mostRecentData = code.data;
    forgetterTimer = setTimeout(() => {
      console.log('[info] forgetting most recent data:', mostRecentData);
      mostRecentData = '';
    }, 10000); // forget last card
    console.log('start getting');
    // skipCache option is not set so will default to false (will use previously downloaded audio)
    play(mostRecentData).catch((error)=> console.error('play failed:', error.message)); // easiest way to protect against this is to verify it against an allowed list
    console.log('done getting');
  }

  const key = cv.waitKey(delay); // Press ESC to quit
  if (key != 27) {
    setTimeout(() => frameCapture(), MSEC_PER_FRAME);
  } else {
    clearTimeout(forgetterTimer);
    console.log('[ESC] stopping...');
  }
};

const decorateCode = (code, frameMat) => {
  let tlc = code.location.topLeftCorner;
  let trc = code.location.topRightCorner;
  let blc = code.location.bottomLeftCorner;
  let brc = code.location.bottomRightCorner;
  frameMat.drawLine(new cv.Point2(tlc.x, tlc.y), new cv.Point2(trc.x, trc.y), GREEN_BGR, thickness);
  frameMat.drawLine(new cv.Point2(trc.x, trc.y), new cv.Point2(brc.x, brc.y), GREEN_BGR, thickness);
  frameMat.drawLine(new cv.Point2(brc.x, brc.y), new cv.Point2(blc.x, blc.y), GREEN_BGR, thickness);
  frameMat.drawLine(new cv.Point2(blc.x, blc.y), new cv.Point2(tlc.x, tlc.y), GREEN_BGR, thickness);

  frameMat.putText(code.data, new cv.Point2(blc.x - 20, blc.y + 20), cv.FONT_HERSHEY_SIMPLEX, 1, RED_BGR, 2);
}

frameCapture();
