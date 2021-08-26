<!-- This is the Footer component that contains contact info as well as a firebase document reset
button when developing locally with a test-worker account. It gets rendered by App.svelte and makes
use of the DEV_MODE variable thats set when the app is compiled-->
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

<style>
  .banner {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    text-align: center;
    padding: 0.5rem;
    border-radius: 0.25rem;
  }
  .icon:hover {
    cursor: pointer;
  }
  p {
    display: inline;
  }
</style>

<!-- svelte-ignore missing-declaration -->
<div
  class="has-text-white banner"
  class:has-background-danger={DEV_MODE}
  class:has-background-grey-light={!DEV_MODE}>
  <!-- svelte-ignore missing-declaration -->
  {#if DEV_MODE}
    <p>Development mode</p>
    <span class="icon" on:click={() => dispatch('resetTestWorker')}>
      <i class="fas fa-redo-alt" />
    </span>
  {:else}
    <p>
      If if you have questions about this HIT please <a
        href="mailto:eshin.jolly@dartmouth.edu">email us</a>
    </p>
  {/if}
</div>
