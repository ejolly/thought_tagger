// Initialize firebase
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';
import { writable } from 'svelte/store';

// GLOBAL EXPERIMENT VARIABLES
export const globalVars = {
  bonusPerRecording: 0.5,
  basePayment: 1.0,
  maxQuizAttempts: 2,
  numRecordings: 3,
};

const firebaseConfig = {
  apiKey: 'AIzaSyBSDQTQrnklilGdmyZcEXMGhIwg0dFpNlY',
  authDomain: 'thought-segmentation.firebaseapp.com',
  databaseURL: 'https://thought-segmentation.firebaseio.com',
  projectId: 'thought-segmentation',
  storageBucket: 'thought-segmentation.appspot.com',
  messagingSenderId: '456731753647',
  appId: '1:456731753647:web:079b4e850e4c03f2e1a85a',
};

firebase.initializeApp(firebaseConfig);

// Export firebase globals for use elsewhere in the app
export const db = firebase.firestore();
export const storage = firebase.storage();
export const auth = firebase.auth();
export const serverTime = firebase.firestore.FieldValue.serverTimestamp();
export const increment = firebase.firestore.FieldValue.increment(1);

// Creates dictionary to allow for number referencing of recordings
export const makeRecordingDict = async () => {
  let count = -1; // accounts for quiz.mp3
  const recordingDict = {};
  const storageItems = await storage.ref().listAll();
  storageItems.items.forEach((itemRef) => {
    // All the items under listRef.
    recordingDict[itemRef.location.path] = count;
    count += 1;
  });
  return recordingDict;
};

// Functions to parse the URL to get workerID, hitID, and assignmentID
const unescapeURL = (s) => decodeURIComponent(s.replace(/\+/g, '%20'));
export const getURLParams = () => {
  const params = {};
  const m = window.location.href.match(/[\\?&]([^=]+)=([^&#]*)/g);
  if (m) {
    let i = 0;
    while (i < m.length) {
      const a = m[i].match(/.([^=]+)=(.*)/);
      params[unescapeURL(a[1])] = unescapeURL(a[2]);
      i += 1;
    }
  }
  if (!params.workerId && !params.assignmentId && !params.hitId) {
    // eslint-disable-next-line no-undef
    if (DEV_MODE) {
      console.log(
        'App running in dev mode so HIT submission will not work!\nTo test in the sandbox make sure to deploy the app.'
      );
      params.workerId = 'test-worker';
      params.assignmentId = 'test-assignment';
      params.hitId = 'test-hit';
    }
    console.log(`URL Params:\n ${JSON.stringify(params)}`);
  }
  return params;
};

// Use those functions to get the window URL params and make them available throughout the app
export const params = getURLParams();

// Shuffle array elements inplace: https://javascript.info/task/shuffle
export const fisherYatesShuffle = (array) => {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

    // swap elements array[i] and array[j]
    // we use "destructuring assignment" syntax to achieve that
    // you'll find more details about that syntax in later chapters
    // same can be written as:
    // let t = array[i]; array[i] = array[j]; array[j] = t
    // eslint-disable-next-line no-param-reassign
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// STIMULI DATA MANGEMENT
// Get a random recording document filename guaranteed to have a low number of responses at the time
// this query is made; currently unused
export const getRandomAudioFilename = async () => {
  try {
    const doc = await db
      .collection('recordings')
      .orderBy('responses')
      .limit(1)
      .get();
    return doc.data().name;
  } catch (err) {
    console.error(err);
  }
  return null;
};

// Given a file name from getRandomAudioFilename, get the actual .wav file for HTML <audio> element playback
export const generateFileURL = async (filename) => {
  try {
    const file = storage.refFromURL(
      `gs://thought-segmentation.appspot.com/${filename}`
    );
    const url = await file.getDownloadURL();
    return url;
  } catch (error) {
    console.error(error);
  }
  return null;
};

// Given a filename update the response count for that file
export const updateAudioFileResponseCount = async (filename) => {
  try {
    const query = await db
      .collection('recordings')
      .where('name', '==', filename)
      .limit(1)
      .get();
    const docId = query.docs[0].id;
    await db
      .collection('recordings')
      .doc(docId)
      .update({ responses: increment });
    console.log(
      `successfully incremented response count for: ${filename} ${docId}`
    );
  } catch (err) {
    console.error(err);
  }
  return null;
};

// USER DATA MANAGEMENT
// Initialize store to share user state across the app
export const userStore = writable({});

// Async update user firestore doc given a store as input
export const updateUser = async (userDoc) => {
  try {
    await db.collection('participants').doc(params.workerId).update(userDoc);
    console.log('user doc successfully updated');
  } catch (err) {
    console.error('Error updating user document in firestore');
    console.log(err);
  }
};
// Setup a fresh user account or reset an existing one
export const initUser = async () => {
  // Get N random recordings based upon the least frequently tagged ones thus far
  const trialOrder = [];
  try {
    const query = await db
      .collection('recordings')
      .orderBy('responses')
      .limit(globalVars.numRecordings)
      .get();
    query.forEach((doc) => {
      trialOrder.push(doc.data().name);
    });
    fisherYatesShuffle(trialOrder);

    // Create the user doc
    await db.collection('participants').doc(params.workerId).set({
      workerId: params.workerId,
      assignmentId: params.assignmentId,
      hitId: params.hitId,
      consent_start: serverTime,
      currentState: 'consent',
      quizState: 'overview',
      currentTrial: 1,
      quizAttempts: 0,
      quizPassed: false,
      trials: {},
      trialOrder,
    });
  } catch (error) {
    console.error(error);
  }
};
