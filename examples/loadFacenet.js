import fs  from 'fs';
import path from 'path';
import cv from './utils.js';

export default function () {
  const __dirname = new URL('.', import.meta.url).pathname;
  const modelPath = path.resolve(__dirname, './data/dnn/facenet');

  const prototxt = path.resolve(modelPath, 'facenet.prototxt');
  const modelFile = path.resolve(modelPath, 'res10_300x300_ssd_iter_140000.caffemodel');
  const prototxtExists = fs.existsSync(prototxt);
  const modelFileExists = fs.existsSync(modelFile);

  if (!prototxtExists || !modelFileExists) {
    console.log('could not find facenet model');
    console.log('download the prototxt from: https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt');
    console.log('download the model from: https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel');
    throw new Error('exiting');
  }
  return cv.readNetFromCaffe(prototxt, modelFile);
};
