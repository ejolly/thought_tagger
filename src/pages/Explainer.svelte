<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher(); // to notify App.svelte
  let buttonVisible = false;
</script>

<div class="container is-fluid">
  <div class="columns">
    <div class="column has-text-centered content">
      <h1>Tutorial Video</h1>
      <p>Please watch the following video to learn how to complete the HIT</p>
    </div>
  </div>
  <div class="columns">
    <div class="column has-text-centered">
      <video
        controls
        poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg"
        src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
        on:ended={() => (buttonVisible = true)}
        ><track kind="captions" /></video>
    </div>
  </div>
  {#if buttonVisible}
    <div class="columns">
      <div class="column has-text-centered">
        <button
          class="button is-primary is-large"
          on:click={() => dispatch('finished')}>
          Continue to Quiz
        </button>
      </div>
    </div>
  {/if}
</div>
