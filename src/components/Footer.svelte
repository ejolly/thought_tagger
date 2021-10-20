<!-- This is the Footer component that contains contact info as well as a firebase document reset
button when developing locally with a test-worker account. It gets rendered by App.svelte and makes
use of the DEV_MODE variable thats set when the app is compiled-->
<script>
  import { createEventDispatcher } from 'svelte';
  import { userStore } from '../utils.js';

  const dispatch = createEventDispatcher();
</script>

<style>
  .banner {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100vw;
    padding: 0.5rem;
    font-weight: bold;
  }
  .icon:hover {
    cursor: pointer;
  }
  p {
    display: inline;
  }
  button {
    font-weight: bold;
  }
</style>

<!-- svelte-ignore missing-declaration -->
<div
  class="has-text-white banner is-flex is-justify-content-space-around"
  class:has-background-danger={DEV_MODE}
  class:has-background-grey-light={!DEV_MODE}>
  {#if $userStore.currentState === 'experiment'}
    <div>
      <p>Recording {$userStore.currentTrial} of 385</p>
    </div>
  {/if}
  <div>TAG = add thoughts; FINISHED= rate recording; SAVE = save your work</div>
  <div class:is-invisible={$userStore.currentTrial <= 1}>
    <button class="button is-success is-small" on:click={() => dispatch('redo')}
      >Redo previous</button>
  </div>
</div>
