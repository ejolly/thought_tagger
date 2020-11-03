<script>
  // This is the main experiment page. It takes as input trialOrder, which gets passed in from App.svelte, which itself gets it from firebase. Then it looks at the current trial number the participant is on, gets the audio file URL and passes that info as parameters to the TagThought component.
  import { createEventDispatcher } from 'svelte';
  import { db, params, storage, recordingDict } from '../utils.js';
  import ThoughtTagger from '../components/ThoughtTagger.svelte';
  import Loading from '../components/Loading.svelte';

  // Get trialOrder from App.svelte, which pulls it from firebase
  export let trialOrder;

  // Local variables
  let currentTrial;
  let fileName;
  const dispatch = createEventDispatcher();

  // helper function that uses Google's transaction function to ensure that multi-user conflicts don't lead to an innacurate response count
  function incrementResponse(recordingRef) {
    recordingRef.transaction(function(recording) {
      if (recording) {
        recording.responses++;
        console.log('recording responses incremented in firebase');
      } else {
        console.log('recording does not exist');
      }
      return recording;
    });
  }

  // Function to get a firebase storage URL for a specific audio file that we can ultimately render with Peaks JS
  // eslint-disable-next-line consistent-return
  const generateFileURL = async () => {
    try {
      fileName = trialOrder[currentTrial - 1];
      const file = storage.refFromURL(`gs://thought-segmentation.appspot.com/${fileName}`);
      const url = await file.getDownloadURL();
      return url;
    } catch (error) {
      console.error(error);
    }
  };

  // Before rendering anything see what trial we should be rendering. Because this is an async function we call immediately to dynamically show a loading screen before we get the data in the HTML below
  let filePromise = (async () => {
    try {
      const resp = await db.ref(`participants/${params.workerId}`).once('value');
      currentTrial = resp.val().currentTrial;
      return await generateFileURL();
    } catch (error) {
      return console.error(error);
    }
  })();

  // Function to try to get the next trial's audio file or tell App.svelte to end the experiment
  // TODO: within this function update the count for this particular audio file in the recordings collection
  // RIGHT NOW THIS FUNCTION RUNS SUCCESSFULLY BUT ASYNC IS SOMEHOW OFF (ASK ESHIN)
  const getNextAudioFile = async () => {
    let trialDict = await recordingDict; // async from utils
    let currentTrialNumber = trialDict[fileName]; // gets firebase number
    console.log('name: ', fileName);
    console.log('number: ', currentTrialNumber);

    try {
      const recordingRef = await db.ref(`recordings/${currentTrialNumber}`); // get reference for desired recording
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
  <ThoughtTagger {params} {src} {currentTrial} {fileName} on:next={getNextAudioFile} />
{/await}
