<!-- This is the main experiment page. It takes as input trialOrder, which gets passed in from
App.svelte, which gets it from firebase. Then it looks at the current trial number the participant
is on, gets the audio file URL and passes that info as parameters to the ThoughtTagger component. It
also makes use of the Loading component-->
<script>
  // IMPORTS
  // -------------------------------------------
  import { createEventDispatcher } from 'svelte';
  import {
    db,
    storage,
    userStore,
    globalVars,
    updateUser,
    getRandomAudioFilename,
  } from '../utils.js';
  import ThoughtTagger from '../components/ThoughtTagger.svelte';
  import Loading from '../components/Loading.svelte';
  import VideoModal from '../components/VideoModal.svelte';

  // COMPONENT VARIABLES
  // -------------------------------------------
  let fileName;
  let showVideo = false;
  let videosrc;
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
      // fileName = $userStore.trialOrder[$userStore.currentTrial - 1];
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
      fileName = $userStore.trialOrder[0];
      return await generateFileURL();
    } catch (error) {
      return console.error(error);
    }
  })();

  // Get the next audio file or end the experiment
  const getNextAudioFile = async () => {
    // ThoughtTagger.svelte updates the user's currentTrial (an int) and the response count for the audio file they just rated inside of finish(). Since the userStore subscribes to the changes in the user doc, we can simply get a new random audio file by querying the least rated audio files thus far and then call generateFileURL() defined above, which makes use of the latest value of the user store and therefore pulls the correct next file or ends the experiment.
    try {
      $userStore.bonus = $userStore.bonus + globalVars.bonusPerRecording;
      await updateUser($userStore);
      if ($userStore.currentTrial - 1 === globalVars.numRecordings) {
        dispatch('finished');
      } else {
        // Get a new audio file name based on which have been least rated at the point this function is called (i.e. on a trial-by-trial basis per user)
        fileName = await getRandomAudioFilename();
        $userStore.trialOrder = [...$userStore.trialOrder, fileName];
        await updateUser($userStore);
        filePromise = generateFileURL();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Similar to the filePromise iife above, we request the tutorial video from firebase once so we don't need to reload it each trial. Instead we just do it now even before the component loads and then we have it available to pass into <VideoModal> on all subsequent trials
  (async () => {
    try {
      const tutorialFile = storage.refFromURL(globalVars.tutorialURL);
      videosrc = await tutorialFile.getDownloadURL();
    } catch (err) {
      console.error(err);
    }
  })();
</script>

{#await filePromise}
  <Loading>Preparing Recording...</Loading>
{:then src}
  {#if showVideo}
    <VideoModal {videosrc} on:close={() => (showVideo = !showVideo)} />
  {/if}
  <ThoughtTagger
    {src}
    {fileName}
    on:next={getNextAudioFile}
    on:help={() => (showVideo = !showVideo)} />
{/await}
