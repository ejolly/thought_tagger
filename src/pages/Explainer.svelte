<script>
  import { globalVars, storage } from '../utils.js';
  import { createEventDispatcher } from 'svelte';
  import Loading from '../components/Loading.svelte';

  // COMPONENT VARIABLES
  // -------------------------------------------
  const dispatch = createEventDispatcher();
  let buttonVisible = false;

  // Function to grab video from firebase
  const generateFileUrl = async () => {
    try {
      const file = storage.refFromURL(globalVars.tutorialURL);
      const url = await file.getDownloadURL();
      return url;
    } catch (error) {
      console.error(error);
    }
  };

  // Generate the promise when the component initializes
  // eslint-disable-next-line prefer-const
  let tutorialVideo = generateFileUrl();
</script>

{#await tutorialVideo}
  <Loading>Loading...</Loading>
{:then src}
  <div class="container is-fluid">
    <div class="columns">
      <div class="column has-text-centered content">
        {#if buttonVisible}
          <h1>You're ready to start the quiz</h1>
          <button
            class="button is-primary"
            on:click={() => dispatch('finished')}>
            Continue to Quiz
          </button>
        {:else}
          <h1>Tutorial Video</h1>
          <p>
            Please watch the following video to learn how to complete the HIT
          </p>
        {/if}
      </div>
    </div>
    <div class="columns">
      <div class="column has-text-centered">
        <video
          width="65%"
          controls
          {src}
          on:ended={() => (buttonVisible = true)}
          ><track kind="captions" /></video>
      </div>
    </div>
  </div>
{/await}
