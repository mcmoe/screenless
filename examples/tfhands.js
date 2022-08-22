import 'dotenv-expand/config';
import cv from '@u4/opencv4nodejs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-node';

const vCap = new cv.VideoCapture(0);
const delay = 10;

const FPS = 60;
const MSEC_PER_FRAME = 1000/FPS;

const CONFIDENCE = 0.4;
let scale = 1;

const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

const selectTheDots = (pose, a, b) => pose.keypoints.filter(i => i.name === a || i.name === b);
const connectTheDots = (frameMat, a, b) => {
  if(a.score > CONFIDENCE && b.score > CONFIDENCE) {
    frameMat.drawLine(new cv.Point2(a.x*scale, a.y*scale), new cv.Point2(b.x*scale, b.y*scale), new cv.Vec3(0, 255, 0), 1);
  }
}

const frameCapture = async () => {
    let frameMat = vCap.read();
    if (frameMat.empty) {
      vCap.reset();
      frameMat = vCap.read();
    } 

    // convert to RGB
    let matRGB = frameMat.channels === 1 ? frameMat.cvtColor(cv.COLOR_GRAY2RGB) : frameMat.cvtColor(cv.COLOR_BGR2RGB);

    // scale down if necessary
    let maxDim = Math.max(matRGB.cols, matRGB.rows)
    matRGB = matRGB.resizeToMax(320); 
    scale = maxDim / Math.max(matRGB.cols, matRGB.rows); // will use this to scale back up if needed

    // convert to 3d tensor
    const buffer = new Uint8Array(matRGB.getData().buffer);
    // console.log([matRGB.rows, matRGB.cols, matRGB.channels]);
    let tFrame = tf.tensor3d(buffer, [matRGB.rows, matRGB.cols, matRGB.channels]); // ex: [480, 640, 3]

    const poses = await detector.estimatePoses(tFrame);
    // console.log(JSON.stringify(poses));
    
    /* ---------------
      0: nose
      1: left_eye
      2: right_eye
      3: left_ear
      4: right_ear
      5: left_shoulder
      6: right_shoulder
      7: left_elbow
      8: right_elbow
      9: left_wrist
      10: right_wrist
      11: left_hip
      12: right_hip
      13: left_knee
      14: right_knee
      15: left_ankle
     --------------- */

    /* to connect
        * ...
    */

    // label all kep points deemed confident enough
    poses.forEach((pose) => {
      pose.keypoints.filter(i => i.score > CONFIDENCE).forEach((keypoint) => {
        const {x, y, score, name} = keypoint;
        frameMat.drawCircle(new cv.Point2(x*scale, y*scale), 2, new cv.Vec3(0, 255, 0), 1);
        frameMat.putText(name, new cv.Point2(x*scale+10, y*scale+10), cv.FONT_HERSHEY_SIMPLEX, 0.3, new cv.Vec3(0, 0, 255), 1);
      });

      connectTheDots(frameMat, ...selectTheDots(pose, 'right_elbow', 'right_wrist'));
      connectTheDots(frameMat, ...selectTheDots(pose, 'left_elbow', 'left_wrist'));
      connectTheDots(frameMat, ...selectTheDots(pose, 'left_shoulder', 'right_shoulder'));
      connectTheDots(frameMat, ...selectTheDots(pose, 'left_elbow', 'left_shoulder'));
      connectTheDots(frameMat, ...selectTheDots(pose, 'right_elbow', 'right_shoulder'));
      
    });

    cv.imshow('Video Capture', frameMat);
  
    if (cv.waitKey(delay) === 27) { // Press ESC to quit
      console.log('[ESC] stopping...');
    } else {
        setTimeout(() => frameCapture(), MSEC_PER_FRAME);
    }
  };
  
frameCapture();

console.log('we are here');

// ------------------------------------------------------------------------
// To install tfjs MoveNet for pose detection
// npm i @tensorflow/tfjs-core --save
// npm i @tensorflow/tfjs-converter --save
// npm i @tensorflow-models/pose-detection --save

// Install one of the backends: WebGL:
// npm i @tensorflow/tfjs-backend-webgl --save

// might need this as I do not have a GPU on the PI
// npm i @tensorflow/tfjs-backend-cpu --save

// running the code, I was notified by TF to install their node module to speed things up
// ============================
// Hi, looks like you are running TensorFlow.js in Node.js. To speed things up dramatically, install our node backend, visit https://github.com/tensorflow/tfjs-node for more details. 
// ============================

// npm i @tensorflow/tfjs-node --save


// UPDATE - removing
//     "@tensorflow/tfjs-backend-cpu": "^3.19.0",
//     "@tensorflow/tfjs-core": "^3.3.0",
//     "@tensorflow/tfjs-converter": "^3.19.0",
// from package.json - to test is only indlude tfjs-node will make it any faster.... as mentioned in the log message (see above)

// FINAL UPDATE
// only need tfjs-node, it will bring in everything else! and it is much faster now as a result :)
// IMORTANT - Had to run on an older version 3.13.0 due to bug on anything higher up to latest which as of this writing is 3.19.0
// See: https://github.com/tensorflow/tfjs/issues/5173
