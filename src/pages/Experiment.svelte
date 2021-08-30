<!-- This is the main experiment page. It takes as input trialOrder, which gets passed in from
App.svelte, which gets it from firebase. Then it looks at the current trial number the participant
is on, gets the audio file URL and passes that info as parameters to the ThoughtTagger component. It
also makes use of the Loading component-->
<script>
  // IMPORTS
  // -------------------------------------------
  import { createEventDispatcher } from 'svelte';
  import { db, params, storage, makeRecordingDict } from '../utils.js';
  import ThoughtTagger from '../components/ThoughtTagger.svelte';
  import Loading from '../components/Loading.svelte';

  // INPUTS FROM PARENT COMPONENT
  // -------------------------------------------
  // Get trialOrder from App.svelte, which pulls it from firebase
  export let trialOrder;

  // COMPONENT VARIABLES
  // -------------------------------------------
  let currentTrial;
  let fileName;
  const dispatch = createEventDispatcher();

  // COMPONENT LOGIC
  // -------------------------------------------
  // helper function that uses Google's transaction function to ensure that multi-user conflicts don't lead to an innacurate response count
  function incrementResponse(recordingRef) {
    recordingRef.transaction(function (recording) {
      if (recording) {
        recording.responses++;
        console.log('recording responses incremented in firebase');
      } else {
        console.log('recording does not exist');
      }
      return recording;
    });
  }

  // Get firebase storage URL for a specific audio file that we can ultimately render with Peaks JS
  // eslint-disable-next-line consistent-return
  const generateFileURL = async () => {
    try {
      fileName = trialOrder[currentTrial - 1];
      const file = storage.refFromURL(
        `gs://thought-segmentation.appspot.com/${fileName}`
      );
      const url = await file.getDownloadURL();
      return url;
    } catch (error) {
      console.error(error);
    }
  };

  // Before rendering anything see what trial we should be rendering. Because this is an async function we call immediately to dynamically show a loading screen before we get the data in the HTML below
  let filePromise = (async () => {
    try {
      const resp = await db
        .collection('participants')
        .doc(params.workerId)
        .get();
      currentTrial = resp.data().currentTrial;
      return await generateFileURL();
    } catch (error) {
      return console.error(error);
    }
  })();

  // Function to try to get the next trial's audio file or tell App.svelte to end the experiment
  // RIGHT NOW THIS FUNCTION RUNS SUCCESSFULLY BUT ASYNC IS SOMEHOW OFF (ASK ESHIN)
  const getNextAudioFile = async () => {
    let trialDict = await makeRecordingDict(); // async from utils
    let currentTrialFileId = trialDict[fileName]; // gets firebase number
    console.log('name: ', fileName);
    console.log('id: ', currentTrialFileId);

    try {
      const recordingRef = await db
        .collection('recordings')
        .doc(currentTrialFileId); // get reference for desired recording
      let transactionRes = incrementResponse(recordingRef);
      console.log(transactionRes);
    } catch (error) {
      return console.error(error);
    }
    if (currentTrial === trialOrder.length) {
      dispatch('finished');
    } else {
      currentTrial += 1;
      filePromise = generateFileURL();
    }
  };
</script>

{#await filePromise}
  <Loading>Preparing Recording...</Loading>
{:then src}
  <ThoughtTagger
    {params}
    {src}
    {currentTrial}
    {fileName}
    on:next={getNextAudioFile} />
{/await}
