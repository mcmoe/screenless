import 'dotenv-expand/config';
import cv from '@u4/opencv4nodejs';

const vCap = new cv.VideoCapture(0);
const delay = 10;

const FPS = 60;
const MSEC_PER_FRAME = 1000/FPS;

const frameCapture = async () => {
  let frameMat = vCap.read();
  if (frameMat.empty) {
    vCap.reset();
    frameMat = vCap.read();
  } 

  //frameMat = frameMat.resize(new cv.Size(0,0), 0.2, 0.2);
  cv.imshow('Video Capture', frameMat);

  if (cv.waitKey(delay) === 27) { // Press ESC to quit
    console.log('[ESC] stopping...');
  } else {
      setTimeout(() => frameCapture(), MSEC_PER_FRAME);
  }
};

frameCapture();
