import 'dotenv-expand/config';
import cv from '@u4/opencv4nodejs';
import { grabFrames, drawBlueRect, drawGreenRect  } from './utils.js';

grabFrames(0, 1, function(image) {
    const faceFrontalClassifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_DEFAULT);
    const faceProfileClassifier = new cv.CascadeClassifier(cv.HAAR_PROFILEFACE);
    const eyeClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);

    // detect faces (frontal or profile)
    const faceFrontalResult = faceFrontalClassifier.detectMultiScale(image.bgrToGray());
    const faceProfileResult = faceProfileClassifier.detectMultiScale(image.bgrToGray());
    const frontalModel = faceFrontalResult.objects.length > 0;
    const profileModel = faceProfileResult.objects.length > 0;
    
    if (!faceFrontalResult.objects.length && !faceProfileResult.objects.length) {
        cv.imshow('face detection', image);
        return;
    }

    const faceResult = frontalModel ? faceFrontalResult : faceProfileResult;
    console.log(faceResult);
    const sortByNumDetections = result => result.numDetections
      .map((num, idx) => ({ num, idx }))
      .sort(((n0, n1) => n1.num - n0.num))
      .map(({ idx }) => idx);
    
    // get best result
    const faceRect = faceResult.objects[sortByNumDetections(faceResult)[0]];
    console.log(`[model] frontal: ${frontalModel} | profile: ${profileModel}`);
    console.log('faceRects:', faceResult.objects);
    console.log('confidences:', faceResult.numDetections);
    
    // detect eyes
    const faceRegion = image.getRegion(faceRect);
    const eyeResult = eyeClassifier.detectMultiScale(faceRegion);
    console.log('eyeRects:', eyeResult.objects);
    console.log('confidences:', eyeResult.numDetections);
    
    // get best result
    const eyeRects = sortByNumDetections(eyeResult)
      .slice(0, 2)
      .map(idx => eyeResult.objects[idx]);
    
    // draw face detection
    drawBlueRect(image, faceRect);

    console.log(faceRect);
    const fontScale = 1;
    const red = new cv.Vec(0, 0, 255);
    const point = new cv.Point(faceRect.x, faceRect.y-20)
    const modelName = frontalModel ? 'frontal' : 'profile';
    image.putText(modelName, point, cv.FONT_ITALIC, fontScale, { color: red, thickness: 2 });
    
    // draw eyes detection in face region
    eyeRects.forEach(eyeRect => drawGreenRect(faceRegion, eyeRect));
    
    cv.imshow('face detection', image);
});
