import 'dotenv-expand/config';
import path from 'path';
import cv from '@u4/opencv4nodejs';
export default cv;

export const grabFrames = (videoFile, delay, onFrame) => {
  const cap = new cv.VideoCapture(videoFile);
  let done = false;
  const intvl = setInterval(() => {
    let frame = cap.read();
    // loop back to start on end of stream reached
    if (frame.empty) {
      cap.reset();
      frame = cap.read();
    }
    onFrame(frame);

    const key = cv.waitKey(delay);
    done = key !== -1 && key !== 255;
    if (done) {
      clearInterval(intvl);
      console.log('Key pressed, exiting.');
    }
  }, 0);
};


export const runVideoDetection = (src, detect) => {
  grabFrames(src, 1, frame => {
    detect(frame);
  });
};

export const drawRectAroundBlobs = (binaryImg, dstImg, minPxSize, fixedRectWidth) => {
  const {
    centroids,
    stats
  } = binaryImg.connectedComponentsWithStats();

  // pretend label 0 is background
  for (let label = 1; label < centroids.rows; label += 1) {
    const [x1, y1] = [stats.at(label, cv.CC_STAT_LEFT), stats.at(label, cv.CC_STAT_TOP)];
    const [x2, y2] = [
      x1 + (fixedRectWidth || stats.at(label, cv.CC_STAT_WIDTH)),
      y1 + (fixedRectWidth || stats.at(label, cv.CC_STAT_HEIGHT))
    ];
    const size = stats.at(label, cv.CC_STAT_AREA);
    const blue = new cv.Vec(255, 0, 0);
    if (minPxSize < size) {
      dstImg.drawRectangle(
        new cv.Point(x1, y1),
        new cv.Point(x2, y2),
        { color: blue, thickness: 2 }
      );
    }
  }
};

export const drawRect = (image, rect, color, opts = { thickness: 2 }) =>
  image.drawRectangle(
    rect,
    color,
    opts.thickness,
    cv.LINE_8
  );

// export const drawRect = drawRect;
export const drawBlueRect = (image, rect, opts = { thickness: 2 }) =>
  drawRect(image, rect, new cv.Vec(255, 0, 0), opts);
export const drawGreenRect = (image, rect, opts = { thickness: 2 }) =>
  drawRect(image, rect, new cv.Vec(0, 255, 0), opts);
export const drawRedRect = (image, rect, opts = { thickness: 2 }) =>
  drawRect(image, rect, new cv.Vec(0, 0, 255), opts);


/**
 * add some helpter for examples TS
 */
const __dirname = new URL('.', import.meta.url).pathname;
export const dataPath = path.resolve(__dirname, 'data');
export const getResourcePath = (name) => {
  const fullpath = path.resolve(dataPath, name || '.');
  return fullpath;
};
